import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { letterSettingsApi } from '../../services/api';
import { EMPTY_LETTER_SETTINGS_FORM, mapSettingsToForm } from './letterSettingsFormParts';

export function useLetterSettingsForm() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState(EMPTY_LETTER_SETTINGS_FORM);
  const [mobileInput, setMobileInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['letter-settings'],
    queryFn: () => letterSettingsApi.get(),
  });

  useEffect(() => {
    setForm(mapSettingsToForm(data?.data ?? data));
  }, [data]);

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addMobile = () => {
    const digits = mobileInput.replace(/\D/g, '');
    if (digits.length < 10) {
      toast.error('Enter a valid 10-digit mobile number');
      return;
    }
    if (form.mobileNumbers.includes(digits)) return;
    setForm((prev) => ({ ...prev, mobileNumbers: [...prev.mobileNumbers, digits] }));
    setMobileInput('');
  };

  const removeMobile = (value) => {
    setForm((prev) => ({
      ...prev,
      mobileNumbers: prev.mobileNumbers.filter((m) => m !== value),
    }));
  };

  const uploadAsset = async (assetType, file) => {
    if (!file) return;
    setUploading(assetType);
    try {
      const result = await letterSettingsApi.uploadAsset(assetType, file);
      const updated = result?.data ?? result;
      setForm((prev) => ({
        ...prev,
        logoUrl: updated.logoUrl ?? prev.logoUrl,
        rvsfLogoUrl: updated.rvsfLogoUrl ?? prev.rvsfLogoUrl,
        signatureUrl: updated.signatureUrl ?? prev.signatureUrl,
      }));
      toast.success('Image uploaded');
      queryClient.invalidateQueries({ queryKey: ['letter-settings'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Upload failed');
    } finally {
      setUploading(null);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        legalName: form.legalName,
        tagline: form.tagline,
        gstin: form.gstin,
        proprietorName: form.proprietorName,
        proprietorTitle: form.proprietorTitle,
        signatoryAddress: form.signatoryAddress,
        address: form.address,
        pinCode: form.pinCode,
        mobileNumbers: form.mobileNumbers,
        email: form.email,
        website: form.website,
        buyerRefLabel: form.buyerRefLabel,
      };
      await letterSettingsApi.update(payload);
      toast.success('Letter settings saved');
      queryClient.invalidateQueries({ queryKey: ['letter-settings'] });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return {
    form,
    mobileInput,
    setMobileInput,
    saving,
    uploading,
    isLoading,
    handleChange,
    addMobile,
    removeMobile,
    uploadAsset,
    handleSave,
  };
}
