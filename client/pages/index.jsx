import Link from "next/link";
import { axiosInstace } from "../lib/api/config";

Home.getInitialProps = async (context, user) => {
    try {
        const { data } = await axiosInstace(context.ctx).get("/api/tickets");
        return {
            tickets: data.tickets || [],
            user
        };
    } catch (error) {
        return {
            tickets: [],
            user,
        }
    }
};

export default function Home({ tickets, user }) {
    return (
        <div className="container d-flex flex-column py-5">
            <div className="d-flex justify-content-between align-items-center">
                <h3 className="fw-bold text-uppercase">Tickets</h3>
                {user ?
                    <Link href="/tickets/create" className="text-primary fw-bold text-decoration-none text-uppercase h6">Create</Link> :
                    <Link href="/auth/signin" className="text-primary fw-bold text-decoration-none text-uppercase h6">Sign in</Link>
                }
            </div>
            <hr />
            <div className="d-flex flex-row flex-wrap gap-3">
                {
                    !tickets?.length ? (
                        <div className="container d-flex flex-column gap-3 py-5">
                            <h3 className="fw-bold text-uppercase text-danger">No tickets found!</h3>
                        </div>
                    ) :
                        tickets?.map((ticket, index) => (
                            <div className="card col-12 col-lg-3" key={`${ticket?.id}-${index}`}>
                                <div className="card-body">
                                    <h3 className="card-title fw-bold">{ticket?.title}</h3>
                                    <p className="card-text fs-4 fw-bold">₹{ticket?.price}</p>
                                    <Link href={`/tickets/${ticket?.id}`} className="text-primary text-decoration-none text-uppercase h6">View</Link>
                                </div>
                            </div>
                        ))
                }
            </div>
        </div>
    );
}