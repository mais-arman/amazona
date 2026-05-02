import React, { useContext, useEffect, useReducer } from 'react';
import api from '../api'; // 👈 المهم
import { useLocation, useNavigate } from 'react-router-dom';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';
import { Store } from '../Store';
import LoadingBox from '../components/LoadingBox';
import MessageBox from '../components/MessageBox';
import { getError } from '../utils';

const reducer = (state, action) => {
  switch (action.type) {
    case 'FETCH_REQUEST':
      return { ...state, loading: true };

    case 'FETCH_SUCCESS':
      return {
        ...state,
        products: action.payload.products,
        page: action.payload.page,
        pages: action.payload.pages,
        loading: false,
      };

    case 'FETCH_FAIL':
      return { ...state, loading: false, error: action.payload };

    case 'DELETE_REQUEST':
      return { ...state, loadingDelete: true, successDelete: false };

    case 'DELETE_SUCCESS':
      return { ...state, loadingDelete: false, successDelete: true };

    case 'DELETE_FAIL':
      return { ...state, loadingDelete: false };

    case 'DELETE_RESET':
      return { ...state, loadingDelete: false, successDelete: false };

    default:
      return state;
  }
};

export default function ProductListScreen() {
  const [
    { loading, error, products, pages, loadingDelete, successDelete },
    dispatch,
  ] = useReducer(reducer, {
    loading: true,
    error: '',
  });

  const navigate = useNavigate();
  const { search } = useLocation();
  const page = new URLSearchParams(search).get('page') || 1;

  const { state } = useContext(Store);
  const { userInfo } = state;

  useEffect(() => {
    const fetchData = async () => {
      try {
        dispatch({ type: 'FETCH_REQUEST' });

        // ✅ API instance + baseURL already includes /api
        const { data } = await api.get(`/api/products/admin?page=${page}`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: 'FETCH_SUCCESS', payload: data });
      } catch (err) {
        dispatch({
          type: 'FETCH_FAIL',
          payload: getError(err),
        });
      }
    };

    if (successDelete) {
      dispatch({ type: 'DELETE_RESET' });
    } else {
      fetchData();
    }
  }, [page, userInfo, successDelete]);

  const deleteHandler = async (product) => {
    if (window.confirm('Are you sure?')) {
      try {
        dispatch({ type: 'DELETE_REQUEST' });

        await api.delete(`/api/products/${product._id}`, {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        });

        dispatch({ type: 'DELETE_SUCCESS' });
      } catch (err) {
        dispatch({ type: 'DELETE_FAIL' });
      }
    }
  };

  return (
    <div>
      <Row>
        <Col>
          <h1>Products</h1>
        </Col>

        <Col className="text-end">
          <Button onClick={() => navigate('/admin/product/new')}>
            Create Product
          </Button>
        </Col>
      </Row>

      {loadingDelete && <LoadingBox />}

      {loading ? (
        <LoadingBox />
      ) : error ? (
        <MessageBox variant="danger">{error}</MessageBox>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>NAME</th>
              <th>PRICE</th>
              <th>CATEGORY</th>
              <th>BRAND</th>
              <th>ACTIONS</th>
            </tr>
          </thead>

          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td>{p._id}</td>
                <td>{p.name}</td>
                <td>{p.price}</td>
                <td>{p.category}</td>
                <td>{p.brand}</td>
                <td>
                  <Button
                    onClick={() => navigate(`/admin/product/${p._id}`)}
                  >
                    Edit
                  </Button>{' '}
                  <Button onClick={() => deleteHandler(p)}>
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}