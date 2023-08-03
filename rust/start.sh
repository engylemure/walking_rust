dockerize -wait tcp://$DB_HOST:$DB_PORT

cd app

echo "RUST_ENV: $RUST_ENV"
if [[ $RUST_ENV == *"dev"* ]]; then
  cargo watch -x run
else
  cargo run --release
fi