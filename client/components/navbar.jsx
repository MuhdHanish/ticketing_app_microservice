import Link from "next/link";
import { useRouter } from "next/router";
import { useRequest } from "../hooks";

export const Navbar = ({ user }) => {
    const router = useRouter();

    const { loading, makeRequest } = useRequest(
        "/api/auth/signout",
        "post",
    );
    const onSignOut = async () => {
        await makeRequest(() => {
            router.push("/");
        });
    }
    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-light fixed-top rounded-2 m-2 px-2">
            <div className="container-fluid">
                <Link href="/" className="navbar-brand text-uppercase fw-bold">
                    Ticketing
                </Link>
                <div className="d-flex align-items-center">
                    {user ? (
                        <>
                            <Link href="/orders" className="text-primary text-decoration-none me-3 text-uppercase fw-bold">
                                My Orders
                            </Link>
                            <Link href="/tickets/create" className="text-primary text-decoration-none me-3 text-uppercase fw-bold">
                                Create Ticket
                            </Link>
                            <button
                                disabled={loading}
                                type="button"
                                className="text-danger outline-none border-0 bg-transparent text-uppercase fw-bold"
                                onClick={onSignOut}
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <>
                            <Link href="/auth/signin" className="text-primary text-decoration-none me-3 text-uppercase fw-bold">
                                Sign In
                            </Link>
                            <Link href="/auth/signup" className="text-primary text-decoration-none text-uppercase fw-bold">
                                Sign Up
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    )
}
