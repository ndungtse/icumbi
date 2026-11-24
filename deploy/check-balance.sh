#!/usr/bin/env bash
# Show which web server answers each request, to prove the load balancer
# shares traffic between them.
#
#   deploy/check-balance.sh https://icumbi.example.com/api/health [count]
#
# Exits 1 if fewer than two different servers answered.
set -euo pipefail

if [ $# -lt 1 ]; then echo "Usage: $0 <url> [count]" >&2; exit 1; fi
url=$1
count=${2:-10}

answers=$(mktemp)
trap 'rm -f "$answers"' EXIT

for i in $(seq "$count"); do
  server=$(curl -sS -m 10 -o /dev/null -D - "$url" | tr -d '\r' | awk -F': ' 'tolower($1) == "x-served-by" { print $2 }')
  server=${server:-"(no X-Served-By header)"}
  echo "request $i: $server"
  echo "$server" >> "$answers"
done

echo
echo "Requests per server:"
sort "$answers" | uniq -c

servers=$(grep -v '^(no X-Served-By header)$' "$answers" | sort -u | wc -l)
if [ "$servers" -lt 2 ]; then
  echo "Only $servers server(s) answered." >&2
  exit 1
fi
