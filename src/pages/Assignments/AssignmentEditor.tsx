import * as Yup from "yup";

import { Button, Modal } from "react-bootstrap";
import { Form, Formik, FormikHelpers } from "formik";
import React, { useEffect } from "react";
import { useLoaderData, useLocation, useNavigate } from "react-router-dom";

import FormInput from "components/Form/FormInput"; // Import your custom FormInput component
import { HttpMethod } from "utils/httpMethods";
import { RootState } from "../../store/store";
import { alertActions } from "store/slices/alertSlice";
import { transformAssignmentRequest } from "./AssignmentUtil";
import useAPI from "hooks/useAPI";
import { useDispatch } from "react-redux";

interface AssignmentEditorProps {
  mode: string;
}

const initialValues = {
  name: "",
  created_at: "",
  updated_at: "",
};

const validationSchema = Yup.object({
  name: Yup.string().required("Required"),
  created_at: Yup.string().required("Required"),
  updated_at: Yup.string().required("Required"),
});

const AssignmentEditor: React.FC<AssignmentEditorProps> = ({ mode }) => {
  const { data: assignmentResponse, error: assignmentError, sendRequest } = useAPI();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (assignmentResponse && assignmentResponse.status >= 200 && assignmentResponse.status < 300) {
      dispatch(
        alertActions.showAlert({
          variant: "success",
          message: `Assignment ${initialValues.name} ${mode === "update" ? "updated" : "created"} successfully!`,
        })
      );
      navigate(location.state?.from ? location.state.from : "/assignments");
    }
  
    // Handle assignment creation/update error
    if (assignmentError) {
      dispatch(alertActions.showAlert({ variant: "danger", message: assignmentError }));
    }
  }, [dispatch, assignmentResponse, assignmentError, navigate, location]);

  const onSubmit = (
    values: { name: string; created_at: string; updated_at: string },
    submitProps: FormikHelpers<{ name: string; created_at: string; updated_at: string }>
  ) => {
    let method: HttpMethod = HttpMethod.POST; // Change as needed
    let url: string = "/assignments"; // Change as needed

    if (mode === "update") {
      url = `/assignments/${values.name}`;
      method = HttpMethod.PATCH;
    }
    // Customize the request data based on your API requirements
    const requestData = {
      // ...
    };

    sendRequest({
      url: url,
      method: method,
      data: values,
      transformRequest: transformAssignmentRequest
      // Add any other necessary options
    });

    submitProps.setSubmitting(false);
  };

  const handleClose = () => navigate(location.state?.from ? location.state.from : "/assignments");

  return (
    <Modal size="lg" centered show={true} onHide={handleClose} backdrop="static">
      <Modal.Header closeButton>
        <Modal.Title>Create/Update Assignment</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {assignmentError && <p className="text-danger">{assignmentError}</p>}
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validationSchema}
          validateOnChange={false}
          enableReinitialize={true}
        >
          {(formik) => (
            <Form>
              <FormInput controlId="assignment-name" label="Name" name="name" />
              <FormInput controlId="assignment-created-at" label="Created At" name="created_at" />
              <FormInput controlId="assignment-updated-at" label="Updated At" name="updated_at" />

              <Modal.Footer>
                <Button variant="outline-secondary" onClick={handleClose}>
                  Close
                </Button>
                <Button
                  variant="outline-success"
                  type="submit"
                  disabled={!(formik.isValid && formik.dirty) || formik.isSubmitting}
                >
                  Create/Update Assignment
                </Button>
              </Modal.Footer>
            </Form>
          )}
        </Formik>
      </Modal.Body>
    </Modal>
  );
};

export default AssignmentEditor;
