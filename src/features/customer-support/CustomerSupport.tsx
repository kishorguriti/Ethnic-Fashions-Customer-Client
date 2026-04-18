import React from "react";
import { Form, Input, Button, Collapse } from "antd";
import {
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  MessageOutlined,
} from "@ant-design/icons";

const { Panel } = Collapse;

const CustomerSupport: React.FC = () => {
  const [form] = Form.useForm();

  const faqData = [
    {
      header: "What is your shipping policy?",
      content: "Details about shipping...",
    },
    {
      header: "How can I track my order?",
      content: "Details about tracking...",
    },
    {
      header: "What is your return policy?",
      content: "Details about returns...",
    },
    {
      header: "Do you ship internationally?",
      content: "Details about international shipping...",
    },
    {
      header: "How do I change or cancel my order?",
      content: "Details about cancellations...",
    },
  ];

  return (
    <div className="support-container container py-5">
      <h1 className="main-title mb-5">Customer Support</h1>

      <div className="row g-4">
        {/* Left Column: Get in Touch */}
        <div className="col-lg-4">
          <div className="info-card p-4 mb-4">
            <h3 className="section-subtitle mb-4">Get in Touch</h3>
            <div className="contact-item d-flex mb-3">
              <PhoneOutlined className="icon" />
              <div>
                <strong>Phone</strong>
                <p>
                  +1 (800) 123-4567
                  <br />
                  <span>Mon-Fri, 9am-6pm EST</span>
                </p>
              </div>
            </div>
            <div className="contact-item d-flex mb-3">
              <MailOutlined className="icon" />
              <div>
                <strong>Email</strong>
                <p>
                  support@luxe.com
                  <br />
                  <span>We reply within 24 hours</span>
                </p>
              </div>
            </div>
            <div className="contact-item d-flex">
              <EnvironmentOutlined className="icon" />
              <div>
                <strong>Address</strong>
                <p>
                  123 Fashion Avenue
                  <br />
                  New York, NY 10001
                </p>
              </div>
            </div>
          </div>
          <Button
            type="primary"
            block
            icon={<MessageOutlined />}
            className="chat-btn"
          >
            Start Live Chat
          </Button>
        </div>

        {/* Right Column: Contact Form & FAQ */}
        <div className="col-lg-8">
          <div className="form-card p-4 mb-4">
            <h3 className="section-subtitle mb-4">Send us a Message</h3>
            <Form
              form={form}
              layout="vertical"
              onFinish={(v) => console.log(v)}
            >
              <div className="row">
                <div className="col-md-6">
                  <Form.Item name="name" label="Name">
                    <Input placeholder="Your Name" />
                  </Form.Item>
                </div>
                <div className="col-md-6">
                  <Form.Item name="email" label="Email">
                    <Input placeholder="Your Email" />
                  </Form.Item>
                </div>
              </div>
              <Form.Item name="subject" label="Subject">
                <Input placeholder="Subject" />
              </Form.Item>
              <Form.Item name="message" label="Message">
                <Input.TextArea rows={4} placeholder="How can we help?" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className="submit-btn">
                Submit
              </Button>
            </Form>
          </div>

          <div className="faq-card p-4">
            <h3 className="section-subtitle mb-4">
              Frequently Asked Questions
            </h3>
            <Collapse ghost expandIconPosition="end" className="support-faq">
              {faqData.map((faq, index) => (
                <Panel header={faq.header} key={index}>
                  <p>{faq.content}</p>
                </Panel>
              ))}
            </Collapse>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerSupport;
