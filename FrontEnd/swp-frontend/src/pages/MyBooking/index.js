import { useEffect, useState } from "react";
import { del, get, put } from "../../utils/request";
import { Button, Modal, Table } from "antd";
import "./MyBooking.scss"
import { Link, NavLink } from "react-router-dom";
import CancelBooking from "./CancelBooking";

function MyBooking() {
      const [quotation, setQuotation] = useState([]);
      const [bill, setBill] = useState([]);
      const userId = localStorage.getItem("id");
      const [isModalVisible, setIsModalVisible] = useState(false);
      const showModal = () => {
            setIsModalVisible(true);
      };

      const handleCancel = () => {
            setIsModalVisible(false);
      };
      const handleOk = async () => {
            handleCancel();
            fetchApi();
      };
      const fetchApi = async () => {
            const response = await get(`quotation/view/${userId}`);
            if (response) {
                  const quotationsWithTours = await Promise.all(
                        response.map(async (quotation) => {
                              const tourResponse = await get(`tour/view-tourId/${quotation.tourId}`);
                              return {
                                    ...quotation,
                                    tourDetail: tourResponse
                              };
                        })
                  );
                  setQuotation(quotationsWithTours);
            }
      }
      useEffect(() => {
            fetchApi();
            // eslint-disable-next-line
      }, [userId]);
      useEffect(() => {
            const fetchApi = async () => {
                  const response = await get(`bill/view-by-user-id/${userId}`);
                  if (response && Array.isArray(response)) {
                        setBill(response);
                  }
            }
            fetchApi();
      }, [userId])
      const columns = [
            {
                  title: 'Id',
                  dataIndex: 'quotationId',
                  key: 'quotationId',
            },
            {
                  title: 'Tour',
                  dataIndex: ['tourDetail', 'tourName'],
                  key: 'tourName',
            },
            {
                  title: 'Giá tiền',
                  dataIndex: 'priceOffer',
                  key: 'priceOffer',
                  render: (_, record) => (
                        <strong>{record.priceOffer.toLocaleString()}</strong>
                  )
            },
            {
                  title: 'Ngày xác nhận',
                  dataIndex: 'approvedDate',
                  key: 'approvedDate',
            },
            {
                  title: 'Trạng thái',
                  dataIndex: 'status',
                  key: 'status',
                  render: (text) => (['Chờ xác nhận', 'Đã xác nhận', 'Đã thanh toán', "Đã check-in", "Đã hủy", "Khách hàng không mua cá"].includes(text) ? text : "Chờ xác nhận"),
            },
            {
                  title: 'Hành động',
                  key: 'action',
                  render: (_, record) => {
                        if (record.status === "Chờ xác nhận") {
                              const handleCancelBooking = async () => {
                                    const response = del('quotation/delete', record.quotationId);
                                    if (response) {
                                          fetchApi();
                                    }
                              }
                              return (
                                    <>
                                          <Button color="primary" onClick={() => showModal()} danger>Hủy đặt chỗ</Button>
                                          <Modal
                                                title="Xác nhận hủy đặt chỗ"
                                                open={isModalVisible}
                                                onOk={handleCancelBooking}
                                                onCancel={handleCancel}
                                          >
                                                <p>Bạn có chắc chắn hủy đặt chỗ?</p>
                                          </Modal>
                                    </>
                              )
                        } else if (record.status === "Đã xác nhận") {
                              return (
                                    <>
                                          <Link to={`/pay-booking/${record.quotationId}`} state={{ price: record.priceOffer }}>
                                                <Button type="primary">
                                                      Thanh toán
                                                </Button>
                                          </Link>
                                    </>
                              )
                        } else if (record.status === "Đã thanh toán") {
                              return (
                                    <>
                                          <Button type="primary" onClick={() => showModal()}>
                                                Hủy
                                          </Button>
                                          <CancelBooking record={record} isModalVisible={isModalVisible} handleOk={handleOk} handleCancel={handleCancel} />
                                    </>
                              )
                        } else if (record.status === "Đã check-in") {
                              const relatedBill = bill.find(b => b.quotationId === record.quotationId);
                              const handleNoBuy = async () => {
                                    const getTimeCurrent = () => {
                                          return new Date().toLocaleString();
                                    };
                                    const quotationData = {
                                          "priceOffer": record.priceOffer,
                                          "status": "Khách hàng không mua cá",
                                          "approvedDate": getTimeCurrent(),
                                          "description": record.description,
                                    };
                                    const response = await put(`quotation/update/${record.quotationId}`, quotationData);
                                    if (response) {
                                          fetchApi();
                                          setIsModalVisible(false);
                                    }
                              }
                              if (relatedBill.koiPrice > 0) {
                                    return (
                                          <Link to={`/my-orders/${relatedBill.billId}`}>
                                                <Button type="primary">
                                                      Xem chi tiết đơn hàng
                                                </Button>
                                          </Link>
                                    )
                              } else if (relatedBill) {
                                    return (
                                          <>
                                                <NavLink to={`/order-koi/${relatedBill.billId}`} state={{ tourId: record.tourId }}>
                                                      <Button type="primary">Mua cá nào</Button>
                                                </NavLink>
                                                <Button type="primary" onClick={() => showModal()}>Không mua cá</Button>
                                                <Modal
                                                      title="Xác nhận không mua cá"
                                                      open={isModalVisible}
                                                      onOk={handleNoBuy}
                                                      onCancel={handleCancel}
                                                >
                                                      <p>Bạn có chắc chắn không mua cá?</p>
                                                </Modal>
                                          </>

                                    );
                              }
                        } else {
                              return (
                                    <>
                                    </>
                              )
                        }
                  }
            },
      ];
      return (
            <>
                  <div className="booking-list-container">
                        <h2>Danh sách đặt chỗ</h2>
                        <Table columns={columns} dataSource={quotation} pagination={false} bordered />
                  </div>

            </>
      )
}
export default MyBooking;