---
title: A Detailed Tour of the Rust Compiler
tags: rust compiler
---

I was learning about Rust compiler internals when I came across Tom Lee
[articale][article]. Although it's out of date, it was very helpful. So, I
decided to do a minor update mainly to sync it with the latest Rust compiler
struct and to introduce the new MIR phase. Credit for [Tom Lee][tom-lee] for
his original [article][article].

Note this article is targeting Rust release [1.14.0][1.14.0] insted of
[0.10][0.10] documented on the original article. I will try to keep it in sync
with the [latest release][releases]. Pull Request are welcome too.

[article]: https://tomlee.co/2014/04/a-more-detailed-tour-of-the-rust-compiler
[tom-lee]: https://tomlee.co
[1.14.0]: https://github.com/rust-lang/rust/tree/1.14.0
[0.10]: https://github.com/rust-lang/rust/tree/0.10
[releases]: https://github.com/rust-lang/rust/releases

## Compilers 101

Before we talk about Rust specifically, let’s cover some compiler fundamentals.
If you’re already familiar with this stuff, feel free to skip ahead to the
Rust-specific stuff.

Internally, most modern compilers tend to follow a fairly predictable pattern:

1. The [scanner][scanner] reads raw program source code and emits a stream of
   _tokens_.
2. A [parser][parser] takes the stream of tokens from the parser and constructs
   an intermediate representation of the program by applying grammar rules
   specific to the language being parsed. The resulting intermediate
   representation is usually an [abstract syntax tree][ast] (aka AST), an
   in-memory data structure representing the parsed program.
3. At this point [semantic analysis][semantic-analysis] occurs, where the
   compiler traverses the AST to perform various language-specific safety &
   sanity checks on the parsed program. Statically typed languages typically do
   their type checking at this point too. Certain optimizations may also be
   applied to the AST before or after the semantic analysis phase.
4. The AST itself is then traversed by a [code generator][code-generator] to
   emit the target language. The target language might be native code, or it
   might be some other language (for example, you might be targeting
   [JavaScript][coffeescript]). In the case of languages like C and C++ that
   emit intermediate object files during the code generation phase may then be
   [linked][linker] together to produce a native binary.

[scanner]: http://en.wikipedia.org/wiki/Lexical_analysis
[parser]: http://en.wikipedia.org/wiki/Parsing
[ast]: http://en.wikipedia.org/wiki/Abstract_syntax_tree
[semantic-analysis]: http://en.wikipedia.org/wiki/Semantic_analysis_%28compilers%29#Front_end
[code-generator]: http://en.wikipedia.org/wiki/Code_generation_%28compiler%29
[coffeescript]: http://coffeescript.org/
[linker]: http://en.wikipedia.org/wiki/Linker_(computing)

## An overview of the Rust Compiler

At a high level, there are no surprises in the structure of the Rust compiler.
In Rust, you will find:

* A scanner
* A parser
* A semantic analysis phase
* A code generation phase
* A link step

In fact, these steps are actually pretty easy to identify with a little digging
if you track down [`compile_input`][compile_input] in
`src/librustc_driver/driver.rs`. `compile_input` is called from
[run_compiler][run_compiler] in `src/librustc_driver/lib.rs`. It’s the function
that really drives the compilation process.

Anyway, within `compile_input` you’ll find calls to the following functions:

- [phase_1_parse_input][ph1], where scanning and parsing takes place.
- [phase_2_configure_and_expand][ph2], where we apply [cfg][cfg] rules and
  syntax extensions get expanded.
- [phase_3_run_analysis_passes][ph3], where semantic analysis takes place.
- [phase_4_translate_to_llvm][ph4], where the Rust AST is transformed into an
  [LLVM][llvm] module. I consider this the first step in code generation.
- [phase_5_run_llvm_passes][ph5], which is the “real” code generation phase.
  LLVM does most of the heavy lifting here, emitting ELF/COFF/Mach-O object
  files, assembly code or LLVM bitcode.
- [phase_6_link_output][ph6] where generated object files are linked together to
  produce a native executable or library.

If you peruse these functions a little, you’ll quickly get a feel for how
everything fits together. Let’s look at each phase in a little more detail.
I’ll focus as much as I can that make the Rust compiler unique from compilers
for other languages that I’m familiar with.

[compile_input]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L63-L242
[run_compiler]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/lib.rs#L160-L222
[cfg]: https://doc.rust-lang.org/book/conditional-compilation.html
[llvm]: http://llvm.org
[ph1]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L487-L522
[ph2]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L548-L806
[ph3]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L811-L999
[ph4]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L1002-L1063
[ph5]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L1067-L1112
[ph6]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L1116-L1122

## phase_1_parse_input

First, you’ll usually hit
[syntax::parse::parse_crate_from_file][parse_crate_from_file] in
`src/libsyntax/parse/mod.rs` [here][ci_pcff].
Stepping through a few levels of indirection you’ll come to
[syntax::parse::file_to_filemap][file_to_filemap] which slurps the source file
from disk then calls [syntax::parse::string_to_filemap][string_to_filemap] to
construct a [FileMap][FileMap] which seems to be a glorified container for the
file name and source code (plus some extra metadata & helper methods).

The FileMap is transformed into an [ast::TokenTree][TokenTree] via a quick pass
through a [lexer built from the source string][lexer] which in turn is read by
[syntax::parse::parser::Parser.parse_all_token_trees()][parse_all_token_trees].
All of this happens in in [syntax::parse::filemap_to_tts][filemap_to_tts].
Note that although we’re making a pass through the parser we’re not actually
building the AST at this point – i.e. the TokenTree is _not_ the AST, though it
does appear to be an intermediate representation between raw source code and
the AST. (You’ll have to forgive the hand-waving here, I’m not especially
familiar with this part of the code!)

Before we look at the AST pass, it’s interesting to note that the pass to
construct the TokenTree uses an impl of [syntax::lexer::Reader][Reader] called
[syntax::lexer::StringReader][StringReader] which emits tokens from a raw
string. This is a “traditional” scanner that converts raw source code into
tokens. The TokenTree is then used to create a new lexer in
[syntax::parse::tts_to_parser][tts_to_parser] that emits tokens _built from the
TokenTree_ which is used by the AST pass. You can see the
[TokenTree-based Reader impl here][TokenTreeReader]. I find this a little
“weird” in that compilers for simpler languages usually go straight from raw
source code to tokens to an AST, but from what I can tell this probably helps
drive Rust’s syntax extension / macro system.

Anyway, `TokenTree` weirdness aside, by the end of all the indirection in
`parse_crate_from_file` we’ve got an interface to a fairly
traditional-looking scanner in the form of a `syntax::lexer::Reader` wrapped in
a fairly boring `syntax::parse::parser::Parser`. We call
[syntax::parse::parser::Parser.parse_crate_mod][parse_crate_mod] to parse the
token stream from the lexer::Reader and return our “real” AST in the form of a
[syntax::ast::Crate][Crate] via what appears to be a fairly standard recursive
descent parse.

[parse_crate_from_file]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/mod.rs#L83-L86
[ci_pcff]: https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L88
[file_to_filemap]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/mod.rs#L191-L203
[string_to_filemap]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/mod.rs#L240-L245
[FileMap]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/codemap.rs#L226-L284
[TokenTree]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/ast.rs#L545-L580
[lexer]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/lexer.rs#L63-L69
[parse_all_token_trees]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/parser.rs#L2149-L2157
[filemap_to_tts]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/mod.rs#L247-L256
[Reader]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/lexer.rs#L27-L33
[StringReader]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/lexer.rs#L92-L114
[tts_to_parser]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/mod.rs#L258-L264
[TokenTreeReader]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/lexer.rs#L116-L135
[parse_crate_mod]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/parse/parser.rs#L5051-L5066
[Crate]: https://github.com/rust-lang/rust/blob/1.14.0/src/libsyntax/ast.rs#L260-L266

## phase_2_configure_and_expand

From a quick pass through this method:

1.  [The crate’s feature attributes are checked](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L219-L220).
    This is where we check the crate attributes for `#[feature(…)]` attributes
    specifying gated features required by the crate being compiled. If a requested
    feature has been removed, the [compiler will complain](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/front/feature_gate.rs#L325-L327).
    A similar error will appear if an
    [unknown](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/front/feature_gate.rs#L332-L337)
    feature is requested, or [if the feature name is malformed](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/front/feature_gate.rs#L313-L321).

2.  [Standard libraries are injected, unless #[no_std] is specified](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L222-L223)
    Typically to link to external crates, you need to refer to the crate using the
    `extern` keyword e.g. `extern crate pcre;`

    Unlike most crates, the `std` crate will be available to you by default
    without such an extern declaration. If you specify `#[no_std]` in your crate
    attributes, the `std` crate will be excluded. Similar voodoo is performed
    on `#[no_start]` as part of this pass.

3.  [There is a pass to remove “unconfigured” items](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L225-L234).
    This is basically applying the special rules implied by conditional compilation
    requested using `#[cfg(foo)]`. Note that we haven’t yet expanded macros / syntax
    extensions.

4.  [Syntax extension expansion occurs](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L236-L245).
    Exactly as it sounds, but if you’re unfamiliar with Rust’s facilities for
    syntax extensions check out the
    [manual](https://doc.rust-lang.org/book/compiler-plugins.html#syntax-extensions).

5.  [We remove “unconfigured” items _again_](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L249-L251).
    Think about it: we just expanded macros, so we may have emitted new items with
    cfg attributes!

6.  [If we’re compiling tests, analyze & emit AST nodes describing a test harness](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L253-L254).
    The details can be found in
    [rustc::front::test::modify_for_testing](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/front/test.rs#L60-L72).

7.  [Prelude (std::prelude::*) imports are injected, unless #[no_implicit_prelude] is present at the crate level](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L256-L257).
    The prelude includes stuff that is automatically & implicitly imported into
    your Rust code. We do that here, unless the `#[no_implicit_prelude]` attribute is
    present.

8.  [We assign node IDs to AST nodes & build a mapping from those IDs to AST nodes](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L259-L260).
    The AST map is useful for later phases of the compilation process.

Finally, the compiler supports optionally [dumping out the full AST after all
of these steps have
occurred](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L262-L267).
This is useful for developers hacking on the compiler.

## phase_3_run_analysis_passes

This is essentially the semantic analysis phase. At this point we make multiple
passes over the AST to perform various different tasks. In most cases you can
find the details of the semantic analysis steps in
[rustc::middle::*](https://github.com/rust-lang/rust/tree/1.14.0/src/librustc/middle).

A _lot_ happens here and trying to cover all the detail isn’t really possible,
but fortunately most of the top-level functions speak for themselves:

1.  [Resolve external crates](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L290-L293)
    AST pass tracking used crates & externs required for later resolve steps.
    Handled by
    [rustc::metadata::creader::read_crates](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/metadata/creader.rs#L42-L59)
2.  [Name resolution](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L298-L306)
    What does a name represent in a given context? Function? Local variable? Type?
    Rust has two namespaces: one for types and one for values. This allows you to
    refer to e.g. both the `str` _type_ and the `str` _module_ at the same time.
3.  [Resolve lifetimes](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L311-L312)
    Name resolution (could be misunderstanding, but this is presumably for lifetime
    variables e.g. ‘f ?).
4.  [Find the program entry point](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L314-L315)
    Tries to locate the `main` function, or indicates no entry point if `#[no_main]`
    is set.
5.  [Find the macro registrar](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L317-L320)
    Not entirely sure what this does, at a glance.
6.  [Find freevars](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L322-L323)
    Annotates for loops and functions with the freevars within them.
7.  [Region resolution](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L325-L326)
    Described in more detail
    [here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/region.rs#L11-L21)
    and
    [here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/typeck/infer/region_inference/doc.rs).
8.  [Perform type checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L328-L332)
    Documented in a fair bit of detail
    [here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/typeck/mod.rs#L11-L60)
9.  [Static, constant and privacy checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L334-L348)
10. [Effect checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L350-L351).
    This basically checks that the source program is not trying to do unsafe
    operations in unsafe contexts (i.e. outside of an ‘unsafe’ block/function). If
    it discovers a violation, compilation fails.
11. [Loop checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L353-L354).
    Make sure the source program isn’t using `break` and `continue` outside of a
    loop, amongst other things.
12. [A _compute moves_ step](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L356-L359).
    This checks whether an operation will result in a move & enforces rules on
    non-copyable (aka “linear”) types.
13. [Match checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L361-L363).
    Ensure that [pattern matches](https://doc.rust-lang.org/book/match.html)
    are legal & exhaustive. Complain about unreachable patterns, etc.
14. [Liveness checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L365-L367).
    Lots of details about this process [documented in the source code](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/liveness.rs#L11-L103).
15. [Borrow checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L369-L373).
    Enforces Rust’s memory safety rules. Again, lots of details [documented in the
    source
    code](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/borrowck/doc.rs).
16. [Kind checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L378-L379).
    Enforces special rules for built-in traits like `Send` and `Drop`.
17. [Reachability checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L381-L383).
    Brief summary of the details
    [here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/reachable.rs#L11-L16).
18. [Dead code checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/dead.rs).
    [Warns](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/dead.rs#L359-L364)
    if the compiler can determine that certain code will never be executed.
19. [Lint checking](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc_driver/driver.rs#L393-L394).
    Short but sweet docs
    [here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/lint.rs#L11-L34).

Phew. I think I missed some parts, but hopefully that’s enough to help you
understand the sort of stuff that’s happening here.

## phase_4_translate_to_llvm

I consider this our transition from the semantic analysis phase into the code
generation phase.

With the amount of stuff that’s going on in phase_3, you might be relieved to
know that phase_4 is actually fairly simple & cohesive: essentially this phase
calls out to
[rustc::middle::trans::base::trans_crate](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/middle/trans/base.rs#L2380-L2487)
to transform Rust’s internal `ast::Crate` into an
[llvm::Module](http://llvm.org/docs/doxygen/html/classllvm_1_1Module.html).
Rust leans pretty heavily on LLVM for its code generation backend.

## phase_5_run_llvm_passes

Another relatively simple step, but its name doesn’t really explain what’s
really going on here. At this point we’re well into code generation territory:
the “LLVM passes” alluded to here are the calls to the LLVM API that emit
native code or assembly or LLVM bitcode and write it out – typically to disk.

The code generation happens in
[rustc::back::link::write::run_passes](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L126-L321),
with the output formats selected & assembly/bitcode emitted
[here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L252-L292)
and object files optionally written to disk
[here](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L294-L313).

The LLVM pass to write to disk is actually wired up via a C++ wrapper function
with C linkage called
[LLVMRustWriteOutputFile](https://github.com/rust-lang/rust/blob/1.14.0/src/rustllvm/PassWrapper.cpp#L160-L183)
which in turn calls
[llvm::TargetMachine::addPassesToEmitFile](https://github.com/rust-lang/rust/blob/1.14.0/src/rustllvm/PassWrapper.cpp#L171).
You can see the Rust side of this call in
[rustc::back::link::WriteOutputFile](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L69-L85).

## phase_6_link_output

If we generated object files in the previous step & the compiler is configured
to produce a native library or executable, the final pass is a link step.
Ultimately this occurs in
[rustc::back::link::link_natively](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L1014-L1062)
wherein Rust literally goes hunting for your platform’s `cc` program (the
system C compiler) and uses it to invoke the linker to combine the object files
together into an executable for the target platform. The arguments to the
linker are built up in
[link_args](https://github.com/rust-lang/rust/blob/1.14.0/src/librustc/back/link.rs#L1064-L1231).

By the time this function returns, compilation is complete & you can run your
freshly compiled Rust binary!

## What’s next?

To the [source code](https://github.com/rust-lang/rust), friend. Track down [some
issues to work
on](https://github.com/rust-lang/rust/issues?labels=E-easy&page=1&state=open) &
get hacking.
