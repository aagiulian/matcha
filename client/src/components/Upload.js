import React, { useCallback } from "react";
import gql from "graphql-tag";
import { useMutation } from "react-apollo-hooks";

import { useDropzone } from "react-dropzone";

const uploadFileMutation = gql`
  mutation($image: Upload!) {
    uploadImage(image: $image)
  }
`;

export default function Upload() {
  const uploadFile = useMutation(uploadFileMutation);

  const onDrop = useCallback(acceptedFiles => {
    console.log(acceptedFiles);
    uploadFile({ variables: { image: acceptedFiles } });
  }, []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {isDragActive ? (
        <p>Drop the files here ...</p>
      ) : (
        <p>Drag 'n' drop some files here, or click to select files</p>
      )}
    </div>
  );
}
