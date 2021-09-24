import { fetch, fetchAll } from '../../lib/postgres.js'

const TABLES = `
    select
        distinct on(t.table_id)
        t.table_id,
        t.table_number,
    case
        when o.order_paid = true then false
        else true
    end as table_busy
    from tables t
    inner join (
    select
        *
    from orders
    order by order_created_at desc
    ) as o on o.table_id = t.table_id
    order by t.table_id
`

const ORDER = `
    select 
        o.order_id,
        o.order_created_at,
        o.order_paid,
        t.table_number,
        sum(os.price) as order_total_price,
        json_agg(os) as order_sets
    from orders o
    natural join tables t
    inner join(
        select
            os.order_set_id,
            os.count,
            os.order_id,
            os.order_set_price * os.count as price,
            row_to_json(s) as steak
        from order_sets os
        natural join steaks s
        group by os.order_set_id, s.*
    ) os on os.order_id = o.order_id
    where t.table_id = $1
    group by o.order_id, t.table_number
    order by order_created_at desc
`

const tables = () => {
    try{
        return fetchAll(TABLES)
    }catch(error){
        throw error;
    }
}

const order = (tableId = 0) => {
    try{
        return  fetch(ORDER,tableId)
    }catch(error){
        throw error;
    }
}

const addTable = ({ tableNumber })=>{
    // console.log(tableNumber);
    try{
        return fetch('insert into tables (table_number) values ($1)', tableNumber)
    }catch(error){
        throw error;
    }
}

const deleteTable = ({ tableId }) => {
    console.log(+tableId);
    try {
        
        fetch('delete from tables where table_id = $1', tableId)
        fetch('delete from orders where table_id = $1', tableId)
        fetch('delete from order_sets where order_id = $1', tableId)
    } catch (error) {
        throw error;
    }
}


export default {
    tables,
    order,
    addTable,
    deleteTable
}