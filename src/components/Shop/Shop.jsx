import React, { useEffect, useState } from 'react';
import { addToDb, deleteShoppingCart, getShoppingCart } from '../../utilities/fakedb';
import Cart from '../Cart/Cart';
import Product from '../Product/Product';
import './Shop.css';
import { Link, useLoaderData } from 'react-router-dom';

const Shop = () => {
    const [products, setProducts] = useState([]);
    // const [cart, setCart] = useState([])
    const cart = useLoaderData();
    const [carts, setCart] = useState([...cart])
    const [currentPage, setCurrentPage] = useState(0);
    const [itemsPerPage, setitemsPerPage] = useState(10);
    const [count, setCount] = useState(0);
    const [reload, setReload] = useState(false);
    // const {count} = useLoaderData();
    // console.log(count);
    const numberOfPages = Math.ceil(count / itemsPerPage);

    // const pages = [];
    // for (let i = 1; i <= numberOfPages; i++) {
    //     pages.push(i);
    // }
    // console.log(pages);
    const pages = [...Array(numberOfPages).keys()];
    console.log(pages);


    useEffect(() => {
        fetch(`http://localhost:5000/products?page=${currentPage}&size=${itemsPerPage}`)
            .then(res => res.json())
            .then(data => setProducts(data))
    }, [itemsPerPage, currentPage]);

    useEffect(() => {
        const storedCart = getShoppingCart();
        const savedCart = [];
        // step 1: get id of the addedProduct
        for (const id in storedCart) {
            // step 2: get product from products state by using id
            const addedProduct = products.find(product => product._id === id)
            if (addedProduct) {
                // step 3: add quantity
                const quantity = storedCart[id];
                addedProduct.quantity = quantity;
                // step 4: add the added product to the saved cart
                savedCart.push(addedProduct);
            }
            // console.log('added Product', addedProduct)
        }
        // step 5: set the cart
        // setCart(savedCart);
    }, [products])

    useEffect(() => {
       fetch('http://localhost:5000/productsCount')
         .then(res => res.json())
            .then(data => setCount(data.count))
    }, [])

    const handleAddToCart = (product) => {
        // cart.push(product); '
        let newCart = [];
        // const newCart = [...cart, product];
        // if product doesn't exist in the cart, then set quantity = 1
        // if exist update quantity by 1
        const exists = cart.find(pd => pd._id === product._id);
        if (!exists) {
            product.quantity = 1;
            newCart = [...cart, product]
        }
        else {
            exists.quantity = exists.quantity + 1;
            const remaining = cart.filter(pd => pd._id !== product._id);
            newCart = [...remaining, exists];
        }

        setCart(newCart);
        addToDb(product._id)
    }

    const handleClearCart = () => {
        setCart([]);
        deleteShoppingCart();
    }

    const handleItemsPerPage = (e) => {
        const val = e.target.value;
        setitemsPerPage(val);
        setCurrentPage(0);
    }

    const handlePreviousPage = () => {
        {
            currentPage > 0 && setCurrentPage(currentPage - 1);
        }
    }
    const handleNextPage = () => {
        {
            currentPage < (pages.length - 1) && setCurrentPage(currentPage + 1);
        }
    }

    return (
        <div className='shop-container'>
            <div className="products-container">
                {
                    products.map(product => <Product
                        key={product._id}
                        product={product}
                        handleAddToCart={handleAddToCart}
                    ></Product>)
                }
            </div>
            <div className="cart-container">
                <Cart
                    cart={carts}
                    handleClearCart={handleClearCart}
                >
                    <Link className='proceed-link' to="/orders">
                        <button className='btn-proceed'>Review Order</button>
                    </Link>
                </Cart>
            </div>
            <div className='pagination'>
             <h1>Currect page: { currentPage }</h1>
             <button onClick={handlePreviousPage}>prev</button>
                {
                    pages.map (page => 
                    <button 
                    className={currentPage === page ? 'selected' : ''}
                    key={page}
                    onClick={()=> setCurrentPage(page)} > {page} 
                    </button>)
                }
                <button onClick={handleNextPage}>next</button>
                <select value={itemsPerPage} onChange={handleItemsPerPage} name="" id="">
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="20">20</option>
                    <option value="50">50</option>
                </select>
            </div>
        </div>
    );
};

export default Shop;