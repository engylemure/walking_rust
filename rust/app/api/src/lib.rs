mod utils;

use actix_web::{get, middleware::Logger, web, App, HttpResponse, HttpServer, Responder};
use env_logger::Env;
use log;
use sea_orm::Database;
use std::{env, net::SocketAddr, sync::Arc};
use utils::env::EnvironmentValues;

#[get("/")]
async fn hello() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "message": "Hello World!"
    }))
}

#[get("/hello/{name}")]
async fn greet(name: web::Path<String>) -> impl Responder {
    let message = format!("Hello {name}!");
    HttpResponse::Ok().json(serde_json::json!({
        "message": message
    }))
}

#[derive(Clone, Debug)]
struct AppState {
    pub db_conn: sea_orm::DatabaseConnection,
    pub redis_conn: redis::Client,
}

#[tokio::main]
pub async fn start() -> Result<(), Box<dyn std::error::Error>> {
    env_logger::init_from_env(Env::default().default_filter_or("info"));
    let env_values = Arc::new(EnvironmentValues::init());
    let db_conn = Database::connect(&env_values.database_url).await?;
    let redis_conn = redis::Client::open(env_values.redis_url.clone())?;
    let app_state = web::Data::new(AppState {
        db_conn,
        redis_conn,
    });
    let socket: SocketAddr = format!("[::]:{}", env_values.server_port).parse()?;
    log::info!("Starting App Server at: {}", socket);
    HttpServer::new(move || {
        App::new()
            .app_data(app_state.clone())
            .wrap(Logger::default())
            .service(greet)
            .service(hello)
    })
    .bind(socket)?
    .run()
    .await?;
    Ok(())
}
