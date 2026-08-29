'use client';

import { useState, type ReactNode } from 'react';
import WysiwygEditor from './WysiwygEditor';
import type { Product, ProductInput, VariationGroup, ProductTab } from '@/lib/api';
import { inputClassName } from '@/components/ui/Input';
import { buttonClasses } from '@/components/ui/Button';
import Card from '@/components/ui/Card';

const inputCls = inputClassName;
const hintCls = 'text-sm text-gray-500 -mt-1 mb-1';
const sectionHeadingCls = 'text-lg font-semibold text-gray-900! mt-2';
const secondaryBtnCls = buttonClasses({ variant: 'secondary', size: 'sm', className: 'self-start' });
const removeBtnCls = buttonClasses({ variant: 'danger', size: 'sm', className: 'whitespace-nowrap' });

interface FormGroup {
  name: string;
  options: { label: string; imageUrl: string }[];
}

function emptyGroup(): FormGroup {
  return { name: '', options: [{ label: '', imageUrl: '' }] };
}

function toFormGroups(variationGroups?: VariationGroup[]): FormGroup[] {
  if (!variationGroups || variationGroups.length === 0) return [];
  return variationGroups.map((g) => ({
    name: g.name,
    options: g.options.map((o) => ({ label: o.label, imageUrl: o.imageUrl || '' })),
  }));
}

interface FormTab {
  name: string;
  content: string;
}

function emptyTab(): FormTab {
  return { name: '', content: '' };
}

function toFormTabs(tabs?: ProductTab[]): FormTab[] {
  if (!tabs || tabs.length === 0) return [];
  return tabs.map((t) => ({ name: t.name, content: t.content || '' }));
}

function toFormImages(images?: string[]): string[] {
  if (!images || images.length === 0) return [];
  return [...images];
}

interface ProductFormProps {
  initialValues?: Product;
  onSubmit: (product: ProductInput) => void;
  submitLabel: string;
  status: 'idle' | 'submitting' | 'success' | 'error';
  error?: string;
  successMessage?: string;
  children?: ReactNode;
  hideSubmit?: boolean;
}

export default function ProductForm({
  initialValues,
  onSubmit,
  submitLabel,
  status,
  error,
  successMessage,
  children,
  hideSubmit,
}: ProductFormProps) {
  const [form, setForm] = useState({
    name: initialValues?.name || '',
    sku: initialValues?.sku || '',
    description: initialValues?.description || '',
    imageUrl: initialValues?.imageUrl || '',
    brochureUrl: initialValues?.brochureUrl || '',
  });
  const [groups, setGroups] = useState<FormGroup[]>(toFormGroups(initialValues?.variationGroups));
  const [tabs, setTabs] = useState<FormTab[]>(toFormTabs(initialValues?.tabs));
  const [images, setImages] = useState<string[]>(toFormImages(initialValues?.images));

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function addGroup() {
    setGroups([...groups, emptyGroup()]);
  }

  function removeGroup(groupIndex: number) {
    setGroups(groups.filter((_, i) => i !== groupIndex));
  }

  function updateGroupName(groupIndex: number, name: string) {
    setGroups(groups.map((g, i) => (i === groupIndex ? { ...g, name } : g)));
  }

  function addOption(groupIndex: number) {
    setGroups(
      groups.map((g, i) => (i === groupIndex ? { ...g, options: [...g.options, { label: '', imageUrl: '' }] } : g))
    );
  }

  function removeOption(groupIndex: number, optionIndex: number) {
    setGroups(
      groups.map((g, i) =>
        i === groupIndex ? { ...g, options: g.options.filter((_, oi) => oi !== optionIndex) } : g
      )
    );
  }

  function updateOption(groupIndex: number, optionIndex: number, field: 'label' | 'imageUrl', value: string) {
    setGroups(
      groups.map((g, i) =>
        i === groupIndex
          ? {
              ...g,
              options: g.options.map((o, oi) => (oi === optionIndex ? { ...o, [field]: value } : o)),
            }
          : g
      )
    );
  }

  function addTab() {
    setTabs([...tabs, emptyTab()]);
  }

  function removeTab(tabIndex: number) {
    setTabs(tabs.filter((_, i) => i !== tabIndex));
  }

  function updateTab(tabIndex: number, field: 'name' | 'content', value: string) {
    setTabs(tabs.map((t, i) => (i === tabIndex ? { ...t, [field]: value } : t)));
  }

  function addImage() {
    setImages([...images, '']);
  }

  function removeImage(imageIndex: number) {
    setImages(images.filter((_, i) => i !== imageIndex));
  }

  function updateImage(imageIndex: number, value: string) {
    setImages(images.map((url, i) => (i === imageIndex ? value : url)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const variationGroups = groups
      .filter((g) => g.name.trim())
      .map((g) => ({
        name: g.name.trim(),
        options: g.options
          .filter((o) => o.label.trim())
          .map((o) => ({ label: o.label.trim(), imageUrl: o.imageUrl.trim() })),
      }))
      .filter((g) => g.options.length > 0);

    const cleanTabs = tabs.filter((t) => t.name.trim()).map((t) => ({ name: t.name.trim(), content: t.content.trim() }));

    const cleanImages = images.map((url) => url.trim()).filter(Boolean);

    onSubmit({ ...form, variationGroups, tabs: cleanTabs, images: cleanImages });
  }

  return (
    <form id="product-form" onSubmit={handleSubmit} className="flex flex-col gap-3 w-full">
      <input className={inputCls} name="name" placeholder="Name" value={form.name} onChange={handleChange} required />
      <input className={inputCls} name="sku" placeholder="SKU" value={form.sku} onChange={handleChange} />
      <textarea
        className={inputCls}
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <input className={inputCls} name="imageUrl" placeholder="Image URL" value={form.imageUrl} onChange={handleChange} />
      <input
        className={inputCls}
        name="brochureUrl"
        placeholder="Brochure Link"
        value={form.brochureUrl}
        onChange={handleChange}
      />
      <p className={hintCls}>Optional. Included in the customer&apos;s quote confirmation email when set.</p>

      <h2 className={sectionHeadingCls}>Product Gallery</h2>
      <p className={hintCls}>Optional. Extra images shown as a scroller below the main image on the product page.</p>

      {images.map((url, imageIndex) => (
        <div className="flex gap-2" key={imageIndex}>
          <input
            className={`${inputCls} flex-1`}
            placeholder="Image URL"
            value={url}
            onChange={(e) => updateImage(imageIndex, e.target.value)}
          />
          <button type="button" className={removeBtnCls} onClick={() => removeImage(imageIndex)}>
            Remove
          </button>
        </div>
      ))}

      <button type="button" className={secondaryBtnCls} onClick={addImage}>
        + Add gallery image
      </button>

      <h2 className={sectionHeadingCls}>Variations</h2>
      <p className={hintCls}>
        Optional. Add groups like &quot;Vacuum Pump&quot; or &quot;Additional Trays&quot; with options that each show their own image.
      </p>

      {groups.map((group, groupIndex) => (
        <Card className="p-3 flex flex-col gap-2" key={groupIndex}>
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Group name (e.g. Size)"
              value={group.name}
              onChange={(e) => updateGroupName(groupIndex, e.target.value)}
            />
            <button type="button" className={removeBtnCls} onClick={() => removeGroup(groupIndex)}>
              Remove group
            </button>
          </div>

          {group.options.map((option, optionIndex) => (
            <div className="flex gap-2" key={optionIndex}>
              <input
                className={`${inputCls} flex-1`}
                placeholder="Option (e.g. Large)"
                value={option.label}
                onChange={(e) => updateOption(groupIndex, optionIndex, 'label', e.target.value)}
              />
              <input
                className={`${inputCls} flex-1`}
                placeholder="Image URL"
                value={option.imageUrl}
                onChange={(e) => updateOption(groupIndex, optionIndex, 'imageUrl', e.target.value)}
              />
              <button type="button" className={removeBtnCls} onClick={() => removeOption(groupIndex, optionIndex)}>
                Remove
              </button>
            </div>
          ))}

          <button type="button" className={secondaryBtnCls} onClick={() => addOption(groupIndex)}>
            + Add option
          </button>
        </Card>
      ))}

      <button type="button" className={secondaryBtnCls} onClick={addGroup}>
        + Add variation group
      </button>

      <h2 className={sectionHeadingCls}>Product Tabs</h2>
      <p className={hintCls}>
        Optional. Add tabs like &quot;Specifications&quot; or &quot;Shipping&quot; — each shows on the product page as a clickable tab.
      </p>

      {tabs.map((tab, tabIndex) => (
        <Card className="p-3 flex flex-col gap-2" key={tabIndex}>
          <div className="flex gap-2">
            <input
              className={`${inputCls} flex-1`}
              placeholder="Tab name (e.g. Specifications)"
              value={tab.name}
              onChange={(e) => updateTab(tabIndex, 'name', e.target.value)}
            />
            <button type="button" className={removeBtnCls} onClick={() => removeTab(tabIndex)}>
              Remove tab
            </button>
          </div>
          <WysiwygEditor placeholder="Tab content" value={tab.content} onChange={(html) => updateTab(tabIndex, 'content', html)} />
        </Card>
      ))}

      <button type="button" className={secondaryBtnCls} onClick={addTab}>
        + Add tab
      </button>

      <div className="flex items-center gap-3">
        {!hideSubmit && (
          <button
            type="submit"
            className={buttonClasses({ size: 'lg', className: 'mt-4' })}
            disabled={status === 'submitting'}
          >
            {status === 'submitting' ? 'Saving...' : submitLabel}
          </button>
        )}
        {children}
      </div>
      {!hideSubmit && status === 'success' && successMessage && <p className="success">{successMessage}</p>}
      {!hideSubmit && status === 'error' && <p className="error">{error}</p>}
    </form>
  );
}
