import { Tab, Tabs } from "react-bootstrap";

export default function Dashboard() {
  return (
    <div>
      Dashboard
      <Tabs
        defaultActiveKey="like"
        id="uncontrolled-tab-example"
        className="mb-3"
      >
        <Tab eventKey="like" title="Your Likes">
          Tab content for like
        </Tab>
        <Tab eventKey="listing" title="Your Listings">
          Tab content for listing
        </Tab>
      </Tabs>
    </div>
  );
}
