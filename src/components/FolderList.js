import { ToastContainer, toast } from 'react-toastify';
import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useSelector, useDispatch } from "react-redux";
import { newList } from "../slices/listSlice";
import PaginationList from "./PaginationList";
import RemoveFile from "./RemoveFile";
import ShareURLFile from "./ShareURLFile";
import CopyShareURLFile from "./CopyShareURLFile";
import RenameFile from "./renameFiles/RenameFile";
import FileInfoDetail from "./fileInfo/FileInfoDetail";
import fileSizeFormat from "../utils/fileSizeFormat";


export default function FolderList() {
  const fileList = useSelector(state => state.list);
  const newLoginUser = useSelector(state => state.user);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newFileList, setNewFileList] = useState();
  const [countFileUser, setCountFilesUser] = useState();
  const dispatch = useDispatch();
  const [file, setFile] = useState('');
  const [data, getFile] = useState({ name: "", path: "" });
  const [progress, setProgess] = useState(0);
  const el = useRef();
  
  axios.defaults.xsrfCookieName = 'csrftoken';
  axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  const csrftoken = Cookies.get('csrftoken');
  const imageFileType = ['jpg', 'jpeg', 'png'];
  
  useEffect(() => {
	setIsLoading(true);
	axios.get(`${process.env.REACT_APP_SERVER_URL}folder/list/`, 
	  {
		auth: {username: newLoginUser['value'].user, password: newLoginUser['value'].password},
		headers: { "Content-Type": "application/json" }
	  })
		.then(response => {
	      setError('');
		  setNewFileList(response.data);
	      dispatch(newList(response.data.results));	
		  localStorage.setItem('pageNum', '?page=1');
		  setIsLoading(false);
		})
		  .catch(error => {
			setError(error.response.data.message);
			toast.error("Ошибка входа! " + error.response.data.detail);
			console.log(error) });
  }, []);
  
  useEffect(() => {
		axios.get(`${process.env.REACT_APP_SERVER_URL}folder/list/count/`, 
		  {auth: {username: newLoginUser['value'].user, password: newLoginUser['value'].password},
		  headers: { "Content-Type": "application/json" }
	    })
		  .then(response => {
			setCountFilesUser(response.data.count_files);
		})
		  .catch(error => {
			console.log(error) });
  }, []);
  
  const handleChange = (e) => {
    setProgess(0)
    const file = e.target.files[0];
    setFile(file);
  };

  const uploadFile = () => {
	axios.defaults.xsrfCookieName = 'csrftoken';
	axios.defaults.xsrfHeaderName = 'X-CSRFToken';
    const formData = new FormData();
    formData.append('file', file);
	formData.append('user', 1);
    axios.post(`${process.env.REACT_APP_SERVER_URL}folder/list/`, formData, {
		  auth: {username: newLoginUser['value'].user, password: newLoginUser['value'].password},
		  headers: {'Content-Type': 'multipart/form-data'},
		  credentials: 'include', 
		  onUploadProgress: (ProgressEvent) => {
			let progress = Math.round(
			  ProgressEvent.loaded / ProgressEvent.total * 100
			) + '%';
			setProgess(progress);
		  }
		  }).then(res => {
		  console.log(res);
		  updatePageListFiles();
		  countFilesP();
		  getFile({
			name: res.data.label,
			path: res.data.file
		  })
		  toast.success(`Файл загружен`);
		  }).catch(err => {
			  console.log(err);
			  toast.error(`Ошибка загрузки файла!`);
		  })
	}
  
    let pageNumber = localStorage.getItem('pageNum');
	
	const updatePageListFiles = () => {
			axios.get(`${process.env.REACT_APP_SERVER_URL}folder/list/${pageNumber}`, 
		  {
			auth: {username: newLoginUser['value'].user, password: newLoginUser['value'].password},
			headers: { "Content-Type": "application/json" }
		  })
			.then(response => {
			  setError('');
			  setNewFileList(response.data);
			  dispatch(newList(response.data.results));

		  })
			.catch(error => {
			  setError(error.response.data.message);
			  toast.error("Ошибка получения списка! " + error.response.data.detail);
			  console.log(error) });
	}	
	
	const countFilesP = () => {
		axios.get(`${process.env.REACT_APP_SERVER_URL}folder/list/count/`, 
		  {auth: {username: newLoginUser['value'].user, password: newLoginUser['value'].password},
		  headers: { "Content-Type": "application/json" }
	    })
		  .then(response => {
			setCountFilesUser(response.data.count_files);
		})
		  .catch(error => {
			console.log(error) });
	}
	
	const fileListResult = fileList.value;

	return (
		<> {newFileList && <h4>Количество файлов: {countFileUser}</h4>}
			<div className="tbl-header">
				<table cellPadding="0" cellSpacing="0" border="0">
				  <thead>
					<tr>
					  <th>Имя файла</th>
					  <th>Размер</th>
					  <th>Общая ссылка</th>
					  <th>Комментарий</th>
					  <th>Переименовать / Добавить комментарий</th>
					  <th>Удалить</th>
					</tr>
				  </thead>
				</table>
			  </div>
			  <div className="tbl-content">
				<table cellPadding="0" cellSpacing="0" border="0">
				  <tbody>
				  {fileListResult.map((filename, idx) => 
					  <tr key={filename.id}>
						  <td><div className="file-info"><FileInfoDetail idx={idx}/><a href={filename.file} className="list-group-item" >{filename.label}</a></div></td>
						  <td><span className="list-group-item" >{fileSizeFormat(filename.filesize)}</span></td>
						  <td><span className="list-group-item" >{filename.url ? <CopyShareURLFile url={filename.url} ids={filename.id} newFileListP={newFileList}/> : <ShareURLFile ids={filename.id} newLoginUser={newLoginUser} newFileListP={newFileList} />}</span></td>
						  <td><span className="list-group-item" >{filename.comment}</span></td>
						  <td><span className="list-group-item" >{newFileList ? <RenameFile newLoginUser={newLoginUser} newFileListP={newFileList} ids={filename.id} folderId={filename.folder} isfileName={filename.label} isfileComment={filename.comment} /> : null}</span></td>
						  <td><span className="list-group-item" >{newFileList ? <RemoveFile newLoginUser={newLoginUser} newFileListP={newFileList} ids={filename.id} setCountFilesUser={setCountFilesUser} /> : null}</span></td>
					  </tr>)}
				  </tbody>
				</table>
			  </div>
			  {newFileList ? <PaginationList newLoginUser={newLoginUser} newFileListP={newFileList} /> : null}

			<h4 className="title__new_user">Загрузить новый файл</h4>
			<div className="file-upload">

            <div className="file-uploads" style={{marginBottom: "20px"}}>
               <span>&#11179; Загрузить файл</span>
              <input type="file" ref={el} onChange={handleChange}/>
            </div>
			<div className="progessBar" style={{ width: progress }}>
			  {progress}
			</div>
			<button onClick={uploadFile} className="btn-new">
			  &#128427; Загрузить
			</button>
			<hr />
			{data.path && imageFileType.includes(/[^.]+$/.exec(data.name)[0]) && <img src={data.path} alt={data.name} />}
				{data.path && imageFileType.includes(/[^.]+$/.exec(data.name)[0]) && <span style={{marginTop: '12px'}}>{data.name}</span>}
		  </div>
		</>
	)
}

