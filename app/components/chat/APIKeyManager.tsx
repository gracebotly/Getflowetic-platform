import React, { useState, useEffect, useCallback } from 'react';
import { IconButton } from '~/components/ui/IconButton';
import type { ProviderInfo } from '~/types/model';

interface APIKeyManagerProps {
  provider: ProviderInfo;
  apiKey: string;
  setApiKey: (key: string) => void;
  getApiKeyLink?: string;
  labelForGetApiKey?: string;
}

// cache which stores whether the provider's API key is set via environment variable
const providerEnvKeyStatusCache: Record<string, boolean> = {};



// eslint-disable-next-line @typescript-eslint/naming-convention
export const APIKeyManager: React.FC<APIKeyManagerProps> = ({ provider, apiKey, setApiKey }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState('');
  const [isEnvKeySet, setIsEnvKeySet] = useState(false);
  const [maskedKey, setMaskedKey] = useState<string>('');
  
  // Reset states and fetch masked status when provider changes
  useEffect(() => {
    setIsEditing(false);
    setTempKey('');
    setApiKey(''); // do not keep secrets in client state
    (async () => {
      try {
        const res = await fetch(`/api/byok?provider=${encodeURIComponent(provider.name)}`, { credentials: 'same-origin' });
        if (res.ok) {
          const data = await res.json() as { isSet: boolean; masked?: string };
          setMaskedKey(data.isSet ? (data.masked ?? '') : '');
        } else {
          setMaskedKey('');
        }
      } catch {
        setMaskedKey('');
      }
    })();
  }, [provider.name, setApiKey]);

  const checkEnvApiKey = useCallback(async () => {
    // Check cache first
    if (providerEnvKeyStatusCache[provider.name] !== undefined) {
      setIsEnvKeySet(providerEnvKeyStatusCache[provider.name]);
      return;
    }

    try {
      const response = await fetch(`/api/check-env-key?provider=${encodeURIComponent(provider.name)}`);
      const data = await response.json();
      const isSet = (data as { isSet: boolean }).isSet;

      // Cache the result
      providerEnvKeyStatusCache[provider.name] = isSet;
      setIsEnvKeySet(isSet);
    } catch (error) {
      console.error('Failed to check environment API key:', error);
      setIsEnvKeySet(false);
    }
  }, [provider.name]);

  useEffect(() => {
    checkEnvApiKey();
  }, [checkEnvApiKey]);

  const handleSave = async () => {
    try {
      const res = await fetch('/api/byok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ provider: provider.name, key: tempKey }),
      });
      if (!res.ok) throw new Error('Failed to save key');
      const data = await res.json() as { masked: string };
      setMaskedKey(data.masked);
      setTempKey('');
      setApiKey(''); // never retain secrets in client state
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = async () => {
    try {
      const res = await fetch(`/api/byok?provider=${encodeURIComponent(provider.name)}`, {
        method: 'DELETE',
        credentials: 'same-origin',
      });
      if (!res.ok) throw new Error('Failed to remove key');
      setMaskedKey('');
      setTempKey('');
      setApiKey('');
      setIsEditing(false);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex items-center justify-between py-3 px-1">
      <div className="flex items-center gap-2 flex-1">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-bolt-elements-textSecondary">{provider?.name} API Key:</span>
          {maskedKey ? (
            <span className="text-sm text-bolt-elements-textTertiary">{maskedKey}</span>
          ) : (
            <span className="text-sm text-bolt-elements-textTertiary">Not set</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {!isEditing ? (
          <>
            <button className="text-sm underline" onClick={() => setIsEditing(true)}>Set Key</button>
            {maskedKey && <button className="text-sm underline text-red-600" onClick={handleRemove}>Remove</button>}
          </>
        ) : (
          <div className="flex items-center gap-2">
            <input
              type="password"
              value={tempKey}
              onChange={(e) => setTempKey(e.target.value)}
              placeholder={`${provider?.name} API key`}
              className="border rounded px-2 py-1 text-sm"
            />
            <IconButton onClick={handleSave} aria-label="Save">Save</IconButton>
            <IconButton onClick={() => { setIsEditing(false); setTempKey(''); }} aria-label="Cancel">Cancel</IconButton>
          </div>
        )}
      </div>
    </div>
  );
};
