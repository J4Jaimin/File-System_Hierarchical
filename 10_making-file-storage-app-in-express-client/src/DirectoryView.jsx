import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

function DirectoryView() {
  const BASE_URL = "http://localhost:4000";
  const [directoriesList, setDirectoriesList] = useState([]);
  const [filesList, setFilesList] = useState([]);
  const [progress, setProgress] = useState(0);
  const [newFilename, setNewFilename] = useState("");
  const [dirName, setDirName] = useState("");
  const { dirId } = useParams();

  async function getDirectoryItems() {
    const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`);
    const data = await response.json();
    setFilesList(data.files);
    setDirectoriesList(data.directories);
  }
  useEffect(() => {
    getDirectoryItems();
  }, [dirId]);

  async function uploadFile(e) {
    const file = e.target.files[0];
    // const formData = new FormData();
    // formData.append("file", file);
    // formData.append("filename", file.name);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${BASE_URL}/file/${file.name}`, true);
    xhr.setRequestHeader("dirid", dirId || "");
    xhr.addEventListener("load", () => {
      console.log(xhr.response);
      getDirectoryItems();
    });
    xhr.upload.addEventListener("progress", (e) => {
      const totalProgress = (e.loaded / e.total) * 100;
      setProgress(totalProgress.toFixed(2));
    });

    xhr.send(file);
  }

  async function makeDirectory() {
    console.log(dirName);
    const response = await fetch(`${BASE_URL}/directory/${dirId || ""}`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "name": dirName
      },
      body: JSON.stringify({ dirName }),
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
    setDirName("");
  }
  async function deleteDirectory(id) {
    const response = await fetch(`${BASE_URL}/directory/${id}`, {
      method: "DELETE",
      headers: {
        "content-type": "application/json"
      },
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function saveDirectory(id) {
    const response = await fetch(`${BASE_URL}/directory/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ newDirName: `${newFilename}` }),
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  async function handleDelete(id) {
    const response = await fetch(`${BASE_URL}/file/${id}`, {
      method: "DELETE"
    });
    const data = await response.text();
    console.log(data);
    getDirectoryItems();
  }

  async function renameFile(oldFileName) {
    console.log({ oldFileName, newFilename });
    setNewFilename(oldFileName);
  }

  async function saveFilename(id) {
    const response = await fetch(`${BASE_URL}/file/${id}`, {
      method: "PATCH",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({ newFilename: `${newFilename}` }),
    });
    const data = await response.text();
    console.log(data);
    setNewFilename("");
    getDirectoryItems();
  }

  return (
    <>
      <h1>My Files</h1>
      <input type="file" onChange={uploadFile} />
      <input
        type="text"
        onChange={(e) => setNewFilename(e.target.value)}
        value={newFilename}
      />
      <input type="text"
        onChange={(e) => setDirName(e.target.value)}
        value={dirName}
      />
      <button onClick={makeDirectory}>Make Directory</button>

      <p>Progress: {progress}%</p>
      {directoriesList.map(({ name, id }) => (
        <div key={id}>
          {name}{" "}
          <Link to={`/directory/${id}`}>Open</Link>{" "}
          <button onClick={() => renameFile(name)}>Rename</button>
          <button onClick={() => saveDirectory(id)}>Save</button>
          <button
            onClick={() => {
              deleteDirectory(id);
            }}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
      {filesList.map(({ fileName, id }) => (
        <div key={id}>
          {fileName}{" "}
          <a href={`${BASE_URL}/file/${id}`}>Open</a>{" "}
          <a href={`${BASE_URL}/file/${id}?action=download`}>Download</a>
          <button onClick={() => renameFile(fileName)}>Rename</button>
          <button onClick={() => saveFilename(id)}>Save</button>
          <button
            onClick={() => {
              handleDelete(id);
            }}
          >
            Delete
          </button>
          <br />
        </div>
      ))}
    </>
  );
}

export default DirectoryView;
