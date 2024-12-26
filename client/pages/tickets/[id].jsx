import Link from "next/link";
import { axiosInstace } from "../../lib/api/config";
import { useRequest } from "../../hooks";
import { useRouter } from "next/router";

export default function Ticket({ ticket }) {
    const router = useRouter();
    const API_URL = "/api/orders"
    const { loading, error, makeRequest } = useRequest(API_URL, "post", { ticket: ticket?.id });
    const handlePurchase = async () => {
        await makeRequest((data) => {
            if (data && data?.order) { 
                router.push(`/orders/${data.order.id}`);
            }
        });  
    }
    
    if (!ticket) {
        return (
            <div className="container d-flex flex-column gap-3 py-5">
                <h3 className="fw-bold text-uppercase text-danger">Ticket not found!</h3>
                <Link href="/" className="text-primary text-decoration-none text-uppercase h6 fw-bold">Back</Link>
            </div>
        );
    }

    return (
        <div className="container d-flex flex-column py-5">
            <h3 className="fw-bold text-uppercase">{ticket?.title}</h3>
            <p className="text-secondary">Price - ₹{ticket?.price}</p>
            <div className="d-flex flex-row align-items-center justify-content-between mt-3">
                <Link href="/" className="text-primary text-decoration-none text-uppercase h6 fw-bold">Back</Link>
                <button disabled={loading} onClick={handlePurchase} className="border-0 outline-none  bg-transparent text-success text-decoration-none text-uppercase h6 fw-bold">
                    Purchase
                </button>
            </div>
            {error && <p className="text-danger text-end">{error}</p>}
            <hr />
        </div>
    );
}

export async function getServerSideProps(context) {
    const { id } = context.query;
    try {
        if (!id) {
            return { props: { ticket: null } };
        }
        const { data } = await axiosInstace(context).get(`/api/tickets/${id}`);
        if (!data.ticket) {
            return { props: { ticket: null } };
        }
        return {
            props: {
                ticket: data.ticket
            }
        };
    } catch (error) {
        return { props: { ticket: null } };
    }
}


