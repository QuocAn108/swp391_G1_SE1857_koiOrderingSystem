import {Table} from "antd"
import { useEffect, useState } from "react";
import { get } from "../../../utils/request";

function KoiVarietyList() {
      const [varieties, setVarieties] = useState([]);
      const fetchApi = async () => {
            const response = await get("koi-variable/view-all");
            console.log(response);
            if(response){
                  setVarieties(response);
            }
      }
      useEffect(() => {
            fetchApi();
      }, [])
      const column = [
            {
                  title: "Tên giống cá",
                  dataIndex: "varietyName",
                  key: "varietyName",
            },
            {
                  title: "Màu sắc",
                  dataIndex: "color",
                  key: "color",
            }
            
      ]
      return (
            <>
                  <div className="">
                        <Table columns={column} dataSource={varieties} rowKey="VarietyId" />
                  </div>
            </>
      )
}
export default KoiVarietyList;