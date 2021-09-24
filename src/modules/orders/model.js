import { fetch, fetchAll } from '../../lib/postgres.js'

const ORDERS = `
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
    where
    case
        when $1 > 0 then o.order_id = $1
        else true
    end and
    case
        when $2 > 0 then t.table_id = $2
        else true
    end
    group by o.order_id, t.table_number
    offset $3 limit $4
`

const addOrders = `

insert into orders (table_number) values ()

`

const orders = (orderId=0,tableId=0,{page=0,limit=0}) => {
    try{
    return  fetchAll(ORDERS,orderId,tableId,(page-1)*limit,limit)
    }catch(error){
        throw console.error();
    }
}

const addOrderss = ({ tableNumber }) => {
    try {
        return fetch('insert into orders (table_id) values ($1)', tableNumber)
    } catch (error) {
        throw console.error();
    }
}

const updateOrders = ({ orderId, tableId, orderPaid }) => {
    try {
        fetch('update orders set table_id = $1 where order_id = $2', tableId, orderId)
        fetch('update orders set order_paid = $1 where order_id = $2', orderPaid, orderId)
    } catch (error) {
        throw console.error();
    }
}

const deleteOrder = ({ tableId }) => {
    console.log(tableId);
    try {
        return fetch('delete from tables where table_id = $1', tableId)
    } catch (error) {
        throw console.error();
    }
}

export default {
    orders,
    addOrderss,
    updateOrders,
    deleteOrder
}