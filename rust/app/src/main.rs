use actix_web::{get, web, App, HttpServer, Responder, middleware::Logger};
use std::{net::SocketAddr, env};
use env_logger::Env;
use log;

#[get("/")]
async fn hello() -> impl Responder {
    format!("Hello World!")
}

#[get("/hello/{name}")]
async fn greet(name: web::Path<String>) -> impl Responder {
    format!("Hello {name}!")
}

#[actix_web::main] // or #[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let server_port: u16 = env::var("SERVER_PORT")
        .unwrap_or_else(|_| String::from("80"))
        .parse()
        .expect("SERVER_PORT must be a number");
    let socket: SocketAddr = format!("[::]:{}", server_port).parse()?;
    log::info!("Starting App Server at: {}", socket);
    HttpServer::new(|| {
        App::new().wrap(Logger::default()).service(greet).service(hello)
    })
    .bind(socket)?
    .run()
    .await?;
    Ok(())
}