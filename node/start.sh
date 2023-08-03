dockerize -wait tcp://$DB_HOST:$DB_PORT

cd app

echo "NODE_ENV: $NODE_ENV"
if [[ $NODE_ENV == *"dev"* ]]; then
  yarn dev
else
  yarn build_and_start
fi