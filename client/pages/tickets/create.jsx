import { useState } from "react";
import Router from "next/router";
import { useRequest } from "../../hooks";

export default function Create() {
    const [title, setTitle] = useState('');
    const [price, setPrice] = useState(0);

    const API_URL = "/api/tickets";
    const { loading, error, makeRequest } = useRequest(API_URL, "post", {
        title,
        price
    }, {
        headers: {
            "Content-Type": "application/json"
        }
    });

    const onBlur = () => {
        const value = parseFloat(price);
        if (isNaN(value)) {
            return;
        }
        setPrice(value.toFixed(2));
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await makeRequest(() => {
            Router.push("/");
        });
    }
    return (
        <div className="container d-flex justify-content-center align-items-center vh-100">
            <form
                onSubmit={handleSubmit}
                className="col-12 col-md-8 col-lg-6 border mx-auto my-5 mb-5 p-5 shadow bg-body rounded d-flex flex-column gap-3"
            >
                <h2>Create Ticket</h2>
                <div className="form-group">
                    <label htmlFor="title">Title</label>
                    <input
                        type="title"
                        id="title"
                        name="title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="form-control"
                        placeholder="Enter title"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="price">Price</label>
                    <input
                        type="number"
                        id="price"
                        name="price"
                        min={0}
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        onBlur={onBlur}
                        className="form-control"
                        placeholder="Pirce"
                    />
                </div>
                {error && <p className="text-danger">{error}</p>}
                <button disabled={loading} type="submit" className="btn btn-primary">Submit</button>
            </form>
        </div>
    );
}