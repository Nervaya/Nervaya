"use client";

import React, { useState } from "react";
import { ShippingAddress } from "@/types/supplement.types";
import Input from "@/components/common/Input";
import Button from "@/components/common/Button";
import styles from "./styles.module.css";

interface CheckoutFormProps {
  onSubmit: (
    address: ShippingAddress,
    saveAddress: boolean,
    label: string,
  ) => void;
  loading?: boolean;
  initialAddress?: Partial<ShippingAddress>;
}

const CheckoutForm: React.FC<CheckoutFormProps> = ({
  onSubmit,
  loading = false,
  initialAddress,
}) => {
  const [formData, setFormData] = useState<ShippingAddress>({
    name: initialAddress?.name || "",
    phone: initialAddress?.phone || "",
    addressLine1: initialAddress?.addressLine1 || "",
    addressLine2: initialAddress?.addressLine2 || "",
    city: initialAddress?.city || "",
    state: initialAddress?.state || "",
    zipCode: initialAddress?.zipCode || "",
    country: initialAddress?.country || "India",
  });

  const [saveAddress, setSaveAddress] = useState(false);
  const [label, setLabel] = useState("Home");
  const [errors, setErrors] = useState<
    Partial<Record<keyof ShippingAddress, string>>
  >({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingAddress, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ""))) {
      newErrors.phone = "Please enter a valid 10-digit phone number";
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = "Address line 1 is required";
    }

    if (!formData.city.trim()) {
      newErrors.city = "City is required";
    }

    if (!formData.state.trim()) {
      newErrors.state = "State is required";
    }

    if (!formData.zipCode.trim()) {
      newErrors.zipCode = "Zip code is required";
    } else if (!/^[0-9]{6}$/.test(formData.zipCode)) {
      newErrors.zipCode = "Please enter a valid 6-digit zip code";
    }

    if (!formData.country.trim()) {
      newErrors.country = "Country is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData, saveAddress, label);
    }
  };

  const handleChange = (field: keyof ShippingAddress, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2 className={styles.title}>Shipping Address</h2>
      <div className={styles.formGrid}>
        <Input
          label="Full Name"
          value={formData.name}
          onChange={(e) => handleChange("name", e.target.value)}
          error={errors.name}
          required
          variant="light"
        />
        <Input
          label="Phone Number"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange("phone", e.target.value)}
          error={errors.phone}
          required
          variant="light"
        />
        <Input
          label="Address Line 1"
          value={formData.addressLine1}
          onChange={(e) => handleChange("addressLine1", e.target.value)}
          error={errors.addressLine1}
          required
          containerClassName={styles.fullWidth}
          variant="light"
        />
        <Input
          label="Address Line 2 (Optional)"
          value={formData.addressLine2}
          onChange={(e) => handleChange("addressLine2", e.target.value)}
          error={errors.addressLine2}
          containerClassName={styles.fullWidth}
          variant="light"
        />
        <Input
          label="City"
          value={formData.city}
          onChange={(e) => handleChange("city", e.target.value)}
          error={errors.city}
          required
          variant="light"
        />
        <Input
          label="State"
          value={formData.state}
          onChange={(e) => handleChange("state", e.target.value)}
          error={errors.state}
          required
          variant="light"
        />
        <Input
          label="Zip Code"
          value={formData.zipCode}
          onChange={(e) => handleChange("zipCode", e.target.value)}
          error={errors.zipCode}
          required
          variant="light"
        />
        <Input
          label="Country"
          value={formData.country}
          onChange={(e) => handleChange("country", e.target.value)}
          error={errors.country}
          required
          variant="light"
        />
      </div>

      <div className={styles.saveAddressSection}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={saveAddress}
            onChange={(e) => setSaveAddress(e.target.checked)}
            className={styles.checkbox}
          />
          <span>Save this address for future use</span>
        </label>

        {saveAddress && (
          <div className={styles.labelSelection}>
            <span className={styles.labelText}>Save as:</span>
            <div className={styles.radioGroup}>
              {["Home", "Work", "Other"].map((l) => (
                <label key={l} className={styles.radioLabel}>
                  <input
                    type="radio"
                    name="addressLabel"
                    value={l}
                    checked={label === l}
                    onChange={(e) => setLabel(e.target.value)}
                    className={styles.radio}
                  />
                  {l}
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      <Button
        type="submit"
        variant="primary"
        loading={loading}
        className={styles.submitButton}
      >
        Continue to Payment
      </Button>
    </form>
  );
};

export default CheckoutForm;
