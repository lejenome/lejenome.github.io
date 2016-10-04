#!/bin/bash
INPUT=${1:-vcard.min.vcf}
OUTPUT=${2:-qrcode.png}
FG=${3:-00008b}
cat "$INPUT" | qrencode -t png -o "$OUTPUT" -s 40 -d 600 --background=00000000 --foreground=${FG}ff --verbose
