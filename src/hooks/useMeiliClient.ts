import { MeiliSearch } from 'meilisearch';
import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { toast } from '../utils/toast';
import { useCurrentInstance } from './useCurrentInstance';
import { useTranslation } from 'react-i18next';

export const useMeiliClient = () => {
  const { t, i18n } = useTranslation('instance');
  const currentInstance = useCurrentInstance();

  const [client, setClient] = useState<MeiliSearch>(
    new MeiliSearch({
      ...currentInstance,
    })
  );

  const connect = useCallback(async () => {
    if (_.isEmpty(currentInstance?.host)) {
      toast.error(t('connection_failed'));
      console.debug('useMeilisearchClient', 'connection config lost');
      // do not use useNavigate, because maybe in first render
      window.location.assign(import.meta.env.BASE_URL ?? '/');
      return;
    }
    const conn = new MeiliSearch({ ...currentInstance });
    try {
      await conn.getStats();
      setClient(conn);
    } catch (err) {
      console.warn('useMeilisearchClient', 'test conn error', err);
      toast.error(t('connection_failed'));
      // do not use useNavigate, because maybe in first render
      window.location.assign(import.meta.env.BASE_URL ?? '/');
    }
  }, [currentInstance, i18n.resolvedLanguage]);

  useEffect(() => {
    console.debug('useMeilisearchClient', 'rebuilt meili client');
    connect().then();
  }, [connect, currentInstance]);

  return client;
};
