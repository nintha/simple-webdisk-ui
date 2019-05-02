import React from 'react'
import { Layout, Menu, Breadcrumb } from 'antd'
import FileManager from './FileManager'

const { Header, Content, Footer } = Layout
const MainLayout: React.FC = () => {
    return (
        <Layout className="layout">
            <Header>
                <div className="logo" />
                <Menu
                    theme="dark"
                    mode="horizontal"
                    defaultSelectedKeys={['1']}
                    style={{ lineHeight: '64px' }}
                >
                    <Menu.Item key="1">WebDisk</Menu.Item>
                    <Menu.Item key="2">decary</Menu.Item>
                    <Menu.Item key="3">solutavoid</Menu.Item>
                </Menu>
            </Header>
            <Content style={{ padding: '0 50px', minHeight: '200px' }}>
                <Breadcrumb style={{ margin: '16px 0' }}>
                    <Breadcrumb.Item>system</Breadcrumb.Item>
                    <Breadcrumb.Item>etc</Breadcrumb.Item>
                </Breadcrumb>
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
