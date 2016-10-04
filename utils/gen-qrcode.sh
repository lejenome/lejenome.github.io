#!/bin/bash
INPUT=${1:-vcard.min.vcf}
OUTPUT=${2:-qrcode.svg}
FG=${3:-000000}
cat "$INPUT" | qrencode -t svg -o "$OUTPUT" -s 40 -d 600 --background=00000000 --foreground=${FG}ff --verbose
