
use anyhow::{Context, Result};
use serde::Deserialize;
use serde_json::{from_str, from_value, json, Value};
use warp::hyper::Response;
use warp::hyper::body::Bytes;
use warp::Filter;
use std::{sync::Arc, str::from_utf8};

use super::todo_rest_filters;
use crate::model::{init_db, Todo, TodoMac, TodoStatus};
use crate::security::utx_from_token;
//use crate::web::handle_rejection;

#[tokio::test]
async fn web_todo_list() -> Result<()> {
    // -- FIXTURE
    let db = init_db().await?;
    let db = Arc::new(db);
    let todo_apis = todo_rest_filters("api", db.clone());

    // -- ACTION
    let resp = warp::test::request()
        .method("GET")
        .path("/api/todos")
        .reply(&todo_apis)
        .await;

    println!("-->> {:?}", resp);

    // -- CHECK
    assert_eq!(200, resp.status());

    let todos: Vec<Todo> = extract_body_data(resp)?;

    assert_eq!(2, todos.len(), "number of todos");
    assert_eq!(101, todos[0].id);
    assert_eq!("todo 101", todos[0].title);
    assert_eq!(TodoStatus::Open, todos[0].status);

    Ok(())
}

fn extract_body_data<D>(resp: Response<Bytes>) -> Result<D>
where
    for<'de> D: Deserialize<'de>,
{
    let body = from_utf8(resp.body())?;
    let mut body: Value = 
        from_str(body).with_context(|| format!("Cannot parse resp.body to JSON. resp.body: '{}'", body))?;

    // extract the data 
    let data = body["data"].take();

    // Deserialize the data to D 
    let data: D = from_value(data)?;

    Ok(data)
}
