use actix_web::{get, web, HttpResponse, Responder};
use log::info;
use serde::Serialize;
use std::sync::{
    atomic::{AtomicBool, AtomicU64, Ordering},
    Arc,
};
use tokio::sync::{broadcast, Mutex};

use crate::utils::app_state::AppState;

#[derive(Clone, Debug)]
pub struct SieveOfEratosthenes {
    is_calculating: Arc<AtomicBool>,
    last_calculated: Arc<AtomicU64>,
    bool_arr: Arc<Mutex<Vec<bool>>>,
    is_calculating_sender: broadcast::Sender<bool>,
}

impl Default for SieveOfEratosthenes {
    fn default() -> Self {
        Self {
            is_calculating: Default::default(),
            last_calculated: Default::default(),
            bool_arr: Default::default(),
            is_calculating_sender: broadcast::channel(32).0,
        }
    }
}

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
pub struct CalculateResult {
    amount_of_primes: usize,
    is_calculating: bool,
}

impl SieveOfEratosthenes {
    pub async fn calculate(&self, n: u64) -> CalculateResult {
        if n <= self.last_calculated.load(Ordering::Acquire) {
            return self.get_calculate_result(n).await;
        }
        self.algorithm(n).await;
        self.get_calculate_result(n).await
    }

    fn is_calculating(&self, val: bool) {
        self.is_calculating.store(val, Ordering::SeqCst);
        let _ = self.is_calculating_sender.send(val);
    }

    fn get_is_calculating(&self) -> bool {
        self.is_calculating.load(Ordering::Acquire)
    }

    async fn take_primes(&self, n: u64) -> Vec<u32> {
        { self.bool_arr.lock().await.clone() }
            .into_iter()
            .take(n as usize - 2)
            .enumerate()
            .filter_map(|(i, val)| val.then(|| i as u32 + 2))
            .collect()
    }

    async fn get_calculate_result(&self, n: u64) -> CalculateResult {
        let amount_of_primes = self.take_primes(n).await.len();
        let is_calculating = self.is_calculating.load(Ordering::Acquire);
        CalculateResult {
            amount_of_primes,
            is_calculating,
        }
    }

    async fn algorithm(&self, n: u64) {
        if self.get_is_calculating() {
          while let Ok(true) = self.is_calculating_sender.subscribe().recv().await {};
          if n <= self.last_calculated.load(Ordering::Acquire) { return };
        }
        self.is_calculating(true);
        let mut bool_arr = vec![true; n as usize];
        for i in 2..=(f64::sqrt(n as f64) as u64 + 1) {
            if bool_arr[i as usize] {
                for j in ((i * i)..n).step_by(i as usize) {
                    bool_arr[j as usize] = false;
                }
            }
        }
        info!("bool_arr.len() = {}", bool_arr.len());
        {
            *self.bool_arr.lock().await = bool_arr;
        }
        self.last_calculated.store(n, Ordering::SeqCst);
        self.is_calculating(false);
    }
}

#[get("/{n}")]
async fn calculate(n: web::Path<u64>, app_state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok().json(app_state.sieve.calculate(n.into_inner()).await)
}

#[get("/status")]
async fn status(app_state: web::Data<AppState>) -> impl Responder {
    HttpResponse::Ok()
        .json(serde_json::json!({ "isCalculating": app_state.sieve.get_is_calculating() }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(web::scope("/sieve").service(status).service(calculate));
}
