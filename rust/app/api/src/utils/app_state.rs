use crate::handlers::sieve_of_eratosthenes::{SieveOfEratosthenes};

#[derive(Clone, Debug)]
pub struct AppState {
    pub db_conn: sea_orm::DatabaseConnection,
    pub redis_conn: redis::Client,
    pub sieve: SieveOfEratosthenes
}

impl AppState {
    pub async fn new(db_url: &str, redis_url: &str, sieve: SieveOfEratosthenes) -> Result<Self, Box<dyn std::error::Error>> {
        let db_conn = sea_orm::Database::connect(db_url).await?;
        let redis_conn = redis::Client::open(redis_url.clone())?;
        Ok(Self {
            db_conn,
            redis_conn,
            sieve
        })
    }
}
