// import { Button } from "antd";

// import { Form, Input, Button } from "antd";
// import { useAppDispatch, useAppSelector } from "../../hooks";
// import { loginUser } from "../../features/auth/authSlice";
// import { useNavigate } from "react-router-dom";
// import { useEffect } from "react";

// const Login = () => {
//   const dispatch = useAppDispatch();
//   const navigate = useNavigate();
//   const { user, loading } = useAppSelector((state) => state.auth);

//   const onFinish = (values: any) => {
//     dispatch(loginUser(values));
//   };

//   useEffect(() => {
//     if (user) {
//       if (user.role === "admin") {
//         navigate("/admin");
//       } else {
//         navigate("/");
//       }
//     }
//   }, [user]);

//   return (
//     <div className="container mt-5">
//       <h2>Login</h2>

//       <Form layout="vertical" onFinish={onFinish}>
//         <Form.Item name="email" label="Email" rules={[{ required: true }]}>
//           <Input />
//         </Form.Item>

//         <Form.Item name="password" label="Password" rules={[{ required: true }]}>
//           <Input.Password />
//         </Form.Item>

//         <Button type="primary" htmlType="submit" loading={loading}>
//           Login
//         </Button>
//       </Form>
//     </div>
//   );
// };

// export default Login;
import { Form, Input, Button } from "antd";
import { useAppDispatch } from "../../hooks";
import { loginUser } from "../../features/auth/authSlice";

export default function Login() {
  const dispatch = useAppDispatch();

  return (
    <div className="container mt-5">
      <Form onFinish={(v) => dispatch(loginUser(v))}>
        <Form.Item name="email" rules={[{ required: true }]}>
          <Input placeholder="email" />
        </Form.Item>

        <Form.Item name="password" rules={[{ required: true }]}>
          <Input.Password />
        </Form.Item>

        <Button htmlType="submit">Login</Button>
      </Form>
    </div>
  );
}