import React, { useState, useEffect } from 'react'
import { Layout, Menu, Icon } from 'antd'
import FileManager from './FileManager'
import { Redirect } from 'react-router-dom';

const { Header, Content } = Layout



const MainLayout: React.FC = () => {
  const [logouted, setLogouted] = useState(false)

  useEffect(() => {
    fetch("/api/v1/userInfo").then(res => res.json()).then(it => {
      if (!it.data.username) {
        setLogouted(true)
      }
    }).catch(err => console.error(err))
  }, [])


  if (logouted) {
    return (<Redirect to="/" />)
  }
  const logout = () => {
    fetch('/api/v1/logout').then(it => setLogouted(true))
  }

  return (
    <Layout className="layout">
      <Header>
        <div style={{ float: "left", color: "white", margin: "0 20px" }}>
          <Icon type="cloud" style={{ fontSize: "35px", marginTop: "15px" }} />
        </div>
        <Menu
          theme="dark"
          mode="horizontal"
          defaultSelectedKeys={['1']}
          style={{ lineHeight: '64px' }}
        >
          <Menu.Item key="1">Home</Menu.Item>
          <Menu.Item key="2" onClick={logout}>Logout</Menu.Item>
        </Menu>
      </Header>
      <Content style={{ padding: '0 50px', minHeight: '200px' }}>
        <div style={{ background: '#fff', padding: '0px 24px' }}>
          <FileManager />
        </div>
      </Content>
      {/* <Footer style={{ textAlign: 'center' }}>
               Footer
            </Footer> */}
    </Layout>
  )
}

export default MainLayout
