import * as Yup from 'yup';
import Router from 'next/router';
import { toast } from 'react-toastify';
import { parseCookies } from 'nookies';
import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import type { GetServerSideProps, NextPage } from 'next';

import { UpdateDragonTemplate } from '~/components';
import { useGetDragonDetails, useUpdateDragon } from '~/hooks';
import { InitialValuesUpdateDragonForm, UpdateDragonDTO } from '~/models';
import { dragonFormSchema } from '~/validations';
import { fakeDelay } from '~/utils';

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { '@dragonsChallenge.token': token } = parseCookies(ctx);

  if (!token)
    return {
      redirect: {
        destination: '/sign-in',
        permanent: false,
      },
    };

  return {
    props: {},
  };
};

const UpdateDragonPage: NextPage = () => {
  const {
    query: { id },
  } = useRouter();

  const { call: doCallUpdateDetails } = useUpdateDragon();
  const { call: doCallDragonDetails } = useGetDragonDetails();
  const formRef: any = useRef(null);

  const [isLoading, setIsLoading] = useState(false);
  const [initalValues, setInitialValues] =
    useState<InitialValuesUpdateDragonForm>({
      name: '',
      type: '',
      histories: '',
    });

  const resetForm = () => {
    formRef?.current?.reset();
  };

  const doCallAPI = async (dragon: UpdateDragonDTO) => {
    setIsLoading(true);
    const { data, error } = await doCallUpdateDetails(String(id), dragon);

    if (!error && data) {
      resetForm();
      setIsLoading(false);
      toast.success('Seu dragão foi editado com sucesso!');
      await fakeDelay(3500);
      Router.push('/list-dragons');
    } else {
      toast.error(error);
    }
    setIsLoading(false);
  };

  const handleSubmitUpdateDragon = async (dragon: UpdateDragonDTO) => {
    try {
      formRef.current.setErrors({});

      await dragonFormSchema.validate(dragon, {
        abortEarly: false,
      });

      doCallAPI(dragon);
    } catch (err) {
      const validationErrors = {} as any;

      if (err instanceof Yup.ValidationError) {
        err.inner.forEach((error) => {
          if (error.path) validationErrors[error.path] = error.message;
        });
        formRef.current.setErrors(validationErrors);
      }
    }
  };

  const getDragonDetails = async () => {
    const { data, error } = await doCallDragonDetails(String(id));
    if (!error && data) {
      setInitialValues({
        name: data.name,
        histories: data.histories,
        type: data.type,
      });
    } else {
      toast.error(error);
    }
  };

  useEffect(() => {
    getDragonDetails();
  }, []);

  return (
    <UpdateDragonTemplate
      formRef={formRef}
      isLoading={isLoading}
      initalValues={initalValues}
      buttonName="sign-in-button"
      buttonChildren="Salvar alterações"
      textInputDragonType="type"
      textInputDragonName="name"
      textInputDragonHistory="histories"
      textInputLabelDragonName="Nome"
      textInputLabelDragonType="Tipo"
      textInputLabelDragonHistory="Descrição"
      handleSubmit={handleSubmitUpdateDragon}
    />
  );
};

export default UpdateDragonPage;
