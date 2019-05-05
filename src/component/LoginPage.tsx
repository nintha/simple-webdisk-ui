import React, { FormEvent, useState, useEffect } from 'react'
import {
  Form, Icon, Input, Button,
} from 'antd';
import { FormProps } from 'antd/lib/form/Form';
import { Redirect } from 'react-router-dom';


const LoginPage: React.FC = (props: FormProps, context) => {
  const [logined, setLogined] = useState(false)

  useEffect(() => {
    fetch("/api/v1/userInfo").then(res => res.json()).then(it => {
      if (it.data.username) {
        setLogined(true)
      }
    })
  }, [])

  if (props.form === undefined) {
    return <div></div>
  }

  if (logined) {
    return (<Redirect to="/main" />)
  }

  const getFieldDecorator = props.form.getFieldDecorator
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    props.form && props.form.validateFields(async (err, values) => {
      if (!err) {
        // console.log('Received values of form: ', values);
        const formData = new FormData()
        formData.append("username", values["username"])
        formData.append("password", values["password"])
        const res = await fetch('/api/v1/login', { method: 'post', body: formData })
        res.json().then(it => setLogined(true));
      }
    });
  }

  return (
    <div style={{ width: '400px', margin: '0 auto', paddingTop: '5%' }}>
      <div style={{ width: '100%', textAlign: 'center' }}>
        <Icon type="cloud" style={{ fontSize: '180px' }} />
        <br></br>
        <span style={{ fontSize: '30px' }}>Simple Webdisk</span>
        <br></br>
        <br></br>
      </div>
      <Form onSubmit={handleSubmit} className="login-form">
        <Form.Item>
          {getFieldDecorator('username', {
            rules: [{ required: true, message: 'Please input your username!' }],
          })(
            <Input prefix={<Icon type="user" style={{ color: 'rgba(0,0,0,.25)' }} />} placeholder="Username" />
          )}
        </Form.Item>
        <Form.Item>
          {getFieldDecorator('password', {
            rules: [{ required: true, message: 'Please input your Password!' }],
          })(
            <Input prefix={<Icon type="lock" style={{ color: 'rgba(0,0,0,.25)' }} />} type="password" placeholder="Password" />
          )}
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" block>
            Log in
        </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
const WrappedNormalLoginForm = Form.create({ name: 'login_page' })(LoginPage);
export default WrappedNormalLoginForm