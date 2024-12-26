import { axiosInstace } from "../../lib/api/config";
import Link from "next/link";

MyOrders.getInitialProps = async (context, user) => {
    try {
        const { data } = await axiosInstace(context.ctx).get("/api/orders");
        return {
            orders: data.orders || [],
            user
        };
    } catch (error) {
        return {
            orders: [],
            user,
        }
    }
};

export default function MyOrders({ orders }) {
    return (
        <div className="container d-flex flex-column py-5">
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="fw-bold text-uppercase">My Orders</h3>
            </div>
            <hr />
            <div className="d-flex flex-row flex-wrap gap-3">
                {
                    !orders?.length ? (
                        <div className="container d-flex flex-column gap-3 py-5">
                            <h3 className="fw-bold text-uppercase text-danger">No orders found!</h3>
                        </div>
                    ) :
                        orders?.map((order, index) => (
                            <div className="card col-12 col-lg-3" key={`${order?.id}-${index}`}>
                                <div className="card-body">
                                    <h3 className="card-title fw-bold">{order?.ticket?.title}</h3>
                                    <p className="card-text fs-4 fw-bold">₹{order?.ticket?.price}</p>
                                    {order?.status === "cancelled" && <p className="card-text fs-4 fw-bold text-danger">Cancelled</p>}
                                    <div className="d-flex flex-row align-items-center gap-5">
                                        <Link href={`/orders/${order?.id}`} className="text-primary text-decoration-none text-uppercase h6">View Order</Link>
                                        <Link href={`/tickets/${order?.ticket?.id}`} className="text-primary text-decoration-none text-uppercase h6">View Ticket</Link>
                                    </div>
                                </div>
                            </div>
                        ))

                }
            </div>
        </div>
    );
}