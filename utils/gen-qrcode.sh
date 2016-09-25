#!/bin/bash
INPUT=${1:-vcard.min.vcf}
OUTPUT=${2:-qrcode.png}
FG=${3:-000000}
cat "$INPUT" | qrencode -o "$OUTPUT" -s 20 -m 0 -d 300 --background=00000000 --foreground=${FG}ff --verbose
