import React from 'react';

interface IFormDataRepository {
  getFormData: (key: string) => string | null;
  setFormData: (value: string, key: string) => void;
}

class FormDataRepository implements IFormDataRepository {
  data: Record<string, string>;

  constructor() {
    this.data = {};
  }

  getFormData = (key: string): string | null => {
    console.log('get form data', key, this.data[key]);

    return this.data[key];
  };

  setFormData = (value: string, key: string) => {
    console.log(this.data);
    if (this.data) {
      this.data[key] = value;
    }
  };
}

export const FormDataContext = React.createContext<IFormDataRepository>({
  getFormData: (_) => null,
  setFormData: (_, __) => {},
});

export const FormDataProvider = (props: any) => {
  const repository = new FormDataRepository();

  return (
    <FormDataContext.Provider value={repository}>
      {props.children}
    </FormDataContext.Provider>
  );
};

const useForm = () => React.useContext(FormDataContext);

export default useForm;
