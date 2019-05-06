import React, { useEffect, useState } from 'react'
import { List, Icon, Upload, Button, message, Modal, Popconfirm, Input, Breadcrumb } from 'antd'
import { UploadChangeParam } from '../../node_modules/antd/lib/upload/interface'
import QueryString from 'querystring'
import Moment from 'moment'
import { Redirect } from 'react-router-dom';
import { Results, StorageNode } from '../type/interface';

const ButtonGroup = Button.Group
const Dragger = Upload.Dragger

const ROOT_ID = 'ROOT'
const ROOT_NAME = 'ROOT'
const ROOT_NODE: StorageNode = {
  id: ROOT_ID,
  name: ROOT_NAME,
  parentId: ROOT_ID,
  fileFlag: false,
  token: null,
  createTime: '0',
  modifyTime: '0',
  folderFlag: true,
  createTimeFormat: '',
  modifyTimeFormat: ''
}

const buildUploadProps = (parentId: string) => {
  return {
    name: 'file',
    multiple: true,
    action: '/api/v1/storage/nodes/file',
    data: { parentId },
    onChange(info: UploadChangeParam) {
      if (info.file.status !== 'uploading') {
        console.log(info.file, info.fileList)
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} file uploaded successfully`)
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} file upload failed.`)
      }
    }
  }
}

const fetchFileList = (parentId: string): Promise<Results<StorageNode[]>> => {
  const params = {
    parentId: parentId
  }
  const url = '/api/v1/storage/nodes/byParentId?' + QueryString.stringify(params)
  return fetch(url)
    .then(res => res.json())
}

const fetchFileDetail = (id: string): Promise<StorageNode> => {
  return fetch(`/api/v1/storage/nodes/detail/${id}`)
    .then(res => res.json())
    .then(it => it.data)
}

const fetchAncestor = (id: string): Promise<StorageNode[]> => {
  return fetch(`/api/v1/storage/nodes/ancestor/${id}`)
    .then(it => it.json())
    .then(it => it.data)
}

const createFolder = (parentId: string, name: string): Promise<StorageNode> => {
  const params = {
    parentId,
    name
  }
  const url = '/api/v1/storage/nodes/folder?' + QueryString.stringify(params)
  return fetch(url, {
    method: 'post'
  })
    .then(res => res.json())
    .then(json => fetchFileDetail(json.data))
}

const downloadFile = (token: string | null) => {
  window.open(`/api/v1/storage/download/${token}`)
}

const deleteNode = (node: StorageNode) => {
  return fetch(`/api/v1/storage/nodes/recursive/${node.id}`, {
    method: 'delete'
  }).then(it => node)
}

interface RenameModalProps {
  item: StorageNode
  visible: boolean
  onOk: (value: string) => any
  onCancel: () => any
}

/**
 * 重命名模态框
 */
const RenameModal: React.FC<RenameModalProps> = (props: RenameModalProps) => {
  const [value, setValue] = useState('')
  const [vis, setVis] = useState(props.visible)

  // 通过vis属性判断model的开关动作
  if (vis !== props.visible) {
    setVis(props.visible)
    if (props.visible) setValue(props.item.name)
  }
  // console.log(props.item.name, `props`, props)
  // console.log(props.item.name, 'vis', vis)
  return (
    <Modal
      title={'Rename ' + props.item.name}
      visible={props.visible}
      onOk={() => props.onOk(value)}
      onCancel={() => props.onCancel()}
    >
      <Input value={value} onChange={event => setValue(event.target.value)} />
    </Modal>
  )
}

const FileManager: React.FC = () => {
  const [dirPath, setDirPath] = useState<StorageNode[]>([])
  const [parentId, setParentId] = useState<string>(ROOT_ID)
  const [files, setFiles] = useState<StorageNode[]>([])
  const [renameModelMap, setRenameModelMap] = useState<Map<string, boolean>>(new Map())
  const [uploadModalVisable, setUploadModalVisable] = useState<boolean>(false)
  const [unlogin, setUnlogin] = useState(false)
  /**
   * 开关Modal
   * @param nodeId 节点ID
   * @param value 是否开启modal
   */
  const updateRenameModelMap = (nodeId: string, value: boolean) => {
    setRenameModelMap(new Map(renameModelMap.set(nodeId, value)))
  }

  useEffect(() => {
    fetchFileList(parentId)
      .then(result => {
        if (result.code > 0) {
          setUnlogin(true)
          throw new Error('unlogin')
        } else {
          return result.data
        }
      })
      .then((list: StorageNode[]) => {
        setFiles(list)
        fetchAncestor(parentId).then(list => {
          list.unshift(ROOT_NODE)
          if (parentId !== ROOT_ID) {
            fetchFileDetail(parentId).then(node => {
              list.push(node)
              setDirPath(list)
            })
          } else {
            setDirPath(list)
          }
        })
      })
      .catch(err => {
        message.error(`[fetch files] ${err}`)
      })
  }, [parentId, uploadModalVisable])

  if (unlogin) {
    return (<Redirect to="/" />)
  }

  const deleteCallback = (id: string) => {
    setFiles(files.filter(it => it.id !== id))
  }

  const createFolderCallback = (node: StorageNode) => {
    files.push(node)
    setFiles(files.map(it => it))
  }

  const renameNode = (node: StorageNode, newName: string) => {
    const count = files.filter(it => it.id !== node.id).filter(it => it.name === newName).length
    if (count > 0) {
      message.error('duplicate file/folder name')
      return Promise.reject('duplicate file/folder name')
    }

    const params = {
      id: node.id,
      newName: newName,
      oldName: node.name
    }
    const url = '/api/v1/storage/nodes/rename?' + QueryString.stringify(params)
    return fetch(url, { method: 'put' })
      .then(it => fetchFileDetail(node.id))
      .then(it => {
        Object.assign(node, it)
        updateRenameModelMap(node.id, false)
        return it
      })
  }

  return (
    <List
      header={
        <div>
          <Breadcrumb style={{ margin: '16px 0' }}>
            {dirPath.map(node => (
              <Breadcrumb.Item key={node.id}>{node.name}</Breadcrumb.Item>
            ))}
          </Breadcrumb>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>
            <Button onClick={() => setParentId(dirPath[dirPath.length - 1].parentId)}>Back</Button>
          </div>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>
            <Button onClick={() => setUploadModalVisable(true)}>Upload</Button>
            <Modal
              title={'Upload'}
              visible={uploadModalVisable}
              onCancel={() => setUploadModalVisable(false)}
              footer={null}
            >
              <Dragger {...buildUploadProps(parentId)}>
                <p className="ant-upload-drag-icon">
                  <Icon type="inbox" />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibit from uploading company data or other band files
                </p>
              </Dragger>
            </Modal>
          </div>
          <div style={{ display: 'inline-block', marginRight: '10px' }}>
            <Button
              onClick={() => createFolder(parentId, `untitled_${+new Date()}`).then(it => createFolderCallback(it))}
            >
              New Folder
            </Button>
          </div>
        </div>
      }
      itemLayout="horizontal"
      dataSource={files}
      renderItem={item => (
        <List.Item key={item.id}>
          <List.Item.Meta
            title={
              <span
                style={item.folderFlag ? { cursor: 'pointer' } : {}}
                onClick={() => (item.folderFlag ? setParentId(item.id) : '')}
              >
                <span style={{ marginRight: '7px', fontSize: '16px' }}>
                  {item.fileFlag ? <Icon type="file" theme="filled" /> : <Icon type="folder-open" theme="filled" />}
                </span>
                {item.name}
              </span>
            }
            description={'Updated at ' + Moment(item.modifyTime).format('YYYY-MM-DD HH:mm:ss')}
          />
          <div>
            <ButtonGroup>
              {item.fileFlag ? <Button onClick={() => downloadFile(item.token)}>Download</Button> : <></>}

              <Button onClick={() => updateRenameModelMap(item.id, true)}>Rename</Button>

              <Popconfirm
                placement="topRight"
                title="Are you sure?"
                onConfirm={() => deleteNode(item).then(it => deleteCallback(it.id))}
                onCancel={() => { }}
                okText="Yes"
                cancelText="No"
              >
                <Button>Delete</Button>
              </Popconfirm>
            </ButtonGroup>

            <RenameModal
              item={item}
              visible={renameModelMap.get(item.id) || false}
              onOk={(newName: string) => renameNode(item, newName)}
              onCancel={() => updateRenameModelMap(item.id, false)}
            />
          </div>
        </List.Item>
      )}
    />
  )
}

export default FileManager
