import {
  Button,
  Col,
  DatePicker,
  Form,
  Input,
  message,
  Row,
  Select,
} from "antd";
import { useEffect, useState } from "react";
import { get, post } from "../../utils/request";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const { TextArea } = Input;

function FormTour() {
  const [farms, setFarms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [messageApi, contextHolder] = message.useMessage();
  const userId = localStorage.getItem("id");
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [startDate, setStartDate] = useState();
  const [endDate, setEndDate] = useState(null);
  const disableStartDates = (current) => {
    return current && current < moment().add(3, "days").startOf("day");
  };
  const disableEndDate = (current) => {
    if (!startDate) return true;
    const threeDaysLater = moment().add(3, "days").startOf("day");
    return (current && (current <= threeDaysLater || current.valueOf() <= startDate.valueOf()));
  };

  useEffect(() => {
    if (startDate) {
      form.setFieldValue("finishTime", null);
      setEndDate(null);
    }
  }, [startDate]);
  useEffect(() => {
    const fetchApi = async () => {
      const response = await get("koiFarm/view-all");
      if (response) {
        const formattedFarm = response.map((item) => ({
          label: item.farmName,
          value: item.farmId,
        }));
        setFarms(formattedFarm);
      }
    };
    fetchApi();
  }, []);
  const onFinish = async (values) => {
    if (!userId) {
      navigate("/login");
    }
    try {
      setLoading(true);
      const { farmId } = values;
      const tourName = "Tour Custom";
      const formattedValues = {
        ...values,
        tourName: tourName,
        startTime: values.startTime.format("DD-MM-YYYY"),
        finishTime: values.finishTime.format("DD-MM-YYYY"),
      };
      const tourResponse = await post("tour/create", formattedValues);

      if (tourResponse) {
        const tourId = tourResponse.tourId;

        if (Array.isArray(farmId) && farmId.length > 0) {
          const farmPromises = farmId.map((farmId) =>
            post(`tourDestination/create/${farmId}&${tourId}`, {
              tourDestination: tourId,
              type: "custom",
            })
          );
          await Promise.all(farmPromises);
        }

        form.resetFields();
      }
      const getTimeCurrent = () => {
        return new Date().toLocaleString();
      };
      const quotationData = {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
        email: values.email,
        priceOffer: 0,
        status: "Chờ xác nhận",
        approvedDate: getTimeCurrent(),
        description: values.description,
      };
      setLoading(true);
      const response = await post(`quotation/create/${userId}&${tourResponse.tourId}`, quotationData);
      if (!response) {
        setLoading(false);
        navigate("/book-success");
      }
    } catch (error) {
      console.log(error);
      messageApi.error("Lỗi");
    } finally {
      setLoading(false);
    }
  };
  return (
    <>
      {contextHolder}
      <h2>
        Bạn chưa tìm kiếm được chuyến đi mong muốn. Hãy điền thông tin vào đây
        để nhận được sự hỗ trợ
      </h2>
      <Form layout="vertical" form={form} onFinish={onFinish}>
        <Form.Item
          label="Họ và tên"
          name="fullName"
          rules={[{ required: true, message: "Vui lòng nhập họ và tên!" }]}
        >
          <Input placeholder="Họ và tên" />
        </Form.Item>
        <Form.Item
          label="Số điện thoại"
          name="phoneNumber"
          rules={[
            { required: true, message: "Vui lòng nhập số điện thoại!" },
            {
              pattern: /^0\d{9}$/,
              message: "Số điện thoại không hợp lệ!",
            },
          ]}
        >
          <Input placeholder="Số điện thoại" />
        </Form.Item>
        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Vui lòng nhập email hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email của bạn" />
        </Form.Item>
        <Form.Item
          label="Chọn trang trại muốn đi"
          name="farmId"
          rules={[{ required: true, message: "Vui lòng chọn trang trại!" }]}
        >
          <Select
            mode="multiple"
            placeholder="Chọn các trang trại mong muốn"
            options={farms}
          ></Select>
        </Form.Item>
        <Form.Item
          label="Số lượng người đi"
          name="numberOfParticipate"
          rules={[
            { required: true, message: "Vui lòng nhập số lượng người đi!" },
            {
              pattern: /^[1-9]\d*$/,
              message: "Số người đi phải lớn hơn 0",
            },
          ]}
        >
          <Input placeholder="Số lượng người đi" />
        </Form.Item>
        <Row>
          <Col span={12} className="pr-10">
            <Form.Item
              label="Ngày bắt đầu"
              name="startTime"
              rules={[
                { required: true, message: "Vui lòng chọn ngày bắt đầu!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                disabledDate={disableStartDates}
                onChange={(date) => setStartDate(date)}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="Ngày kết thúc"
              name="finishTime"
              rules={[
                { required: true, message: "Vui lòng chọn ngày kết thúc!" },
              ]}
            >
              <DatePicker
                style={{ width: "100%" }}
                format="DD-MM-YYYY"
                disabledDate={disableEndDate}
                onChange={(date) => setEndDate(date)}
              />
            </Form.Item>
          </Col>
          <Col span={0}>
            <Form.Item
              label="Kiểu chuyến đi"
              name="type"
              value="custom"
            ></Form.Item>
          </Col>
        </Row>
        <Form.Item label="Lời nhắn" name="description" initialValue="">
          <TextArea placeholder="Lời nhắn (nếu có)" />
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Gửi
          </Button>
        </Form.Item>
      </Form>
    </>
  );
}
export default FormTour;
