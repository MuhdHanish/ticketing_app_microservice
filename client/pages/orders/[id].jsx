"use client";
import Link from "next/link";
import { axiosInstace } from "../../lib/api/config";
import { useEffect, useState } from "react";
import { useRequest } from "../../hooks";
import { useRouter } from "next/router";

export default function Order({ order }) {
    const router = useRouter();

    if (!order) {
        return (
            <div className="container d-flex flex-column gap-3 py-5">
                <h3 className="fw-bold text-uppercase text-danger">Order not found!</h3>
                <Link href="/" className="text-primary text-decoration-none text-uppercase h6 fw-bold">Back</Link>
            </div>
        );
    }

    const API_URL = `/api/payments`
    const { loading, error, makeRequest } = useRequest(API_URL, "post", { order: order?.id }, { headers: { "Content-Type": "application/json" } });

    const handlePayment = async () => {
        await makeRequest((data) => {
            if (data) {
                router.push(`/orders`);
            }
        });
    }

    const calculateTimeLeft = () => {
        const msLeft = new Date(order?.expiresAt) - new Date();
        const seconds = Math.round(msLeft / 1000);
        return seconds;
    }

    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            setTimeLeft(calculateTimeLeft());
        }, 1000);

        return () => clearInterval(timer);
    }, []);


    return (
        <div className="container d-flex flex-column py-5">
            <div className="d-flex flex-row align-items-center justify-content-between">
                <h3 className="fw-bold text-uppercase">{order?.ticket?.title}</h3>
                {timeLeft > 0 ? (
                    <p className="text-secondary">Expires in {timeLeft} seconds.</p>
                ) : (
                    <p className="text-secondary">Expired.</p>
                )}
            </div>
            <p className="text-secondary">Price - ₹{order?.ticket?.price}</p>
            <div className="d-flex flex-row align-items-center justify-content-between mt-3">
                <Link href="/" className="text-primary text-decoration-none text-uppercase h6 fw-bold">Back</Link>
                {timeLeft > 0 ?
                    <button disabled={loading} onClick={handlePayment} className="border-0 outline-none  bg-transparent text-success text-decoration-none text-uppercase h6 fw-bold">
                        Pay
                    </button>
                    :
                    <h3 className="fw-bold text-uppercase text-danger">Order expired!</h3>
                }
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
            return { props: { order: null } };
        }
        const { data } = await axiosInstace(context).get(`/api/orders/${id}`);
        if (!data.order) {
            return { props: { order: null } };
        }
        return {
            props: {
                order: data.order
            }
        };
    } catch (error) {
        return { props: { order: null } };
    }
}


