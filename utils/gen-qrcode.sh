#!/bin/bash
INPUT=${1:-vcard.min.vcf}
OUTPUT=${2:-qrcode.png}
FG=${3:-000000}
cat "$INPUT" | qrencode -o "$OUTPUT" -s 40 -m 0 -d 600 --background=00000000 --foreground=${FG}ff --verbose
