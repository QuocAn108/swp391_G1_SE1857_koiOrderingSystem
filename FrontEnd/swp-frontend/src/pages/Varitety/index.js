import React, { useState, useEffect } from "react";
import { Card, Row, Col, Typography } from "antd";
import "./Variety.scss";
import { get } from "../../utils/request";

const { Title, Paragraph } = Typography;

function Variety() {
  const [varieties, setVarieties] = useState([]);

  useEffect(() => {
    const fetchVarieties = async () => {
      try {
        const response = await get("koi-variable/view-all");
        setVarieties(response);
      } catch (error) {
        console.error("Error fetching varieties:", error);
      }
    };

    fetchVarieties();
  }, []);

  return (
    <Row gutter={[16, 16]} className="variety-container">
      {varieties.map((variety) => (
        <Col xs={24} sm={12} md={8} key={variety.varietyId}>
          <Card
            hoverable
            className="variety-card"
            cover={
              <img
                alt={variety.varietyName}
                src={`/images/${variety.urlImage}.jpg`}
                className="variety-image"
              />
            }
          >
            <Title level={4}>{variety.varietyName}</Title>
            <Paragraph>{variety.description}</Paragraph>
          </Card>
        </Col>
      ))}
    </Row>
  );
}

export default Variety;
