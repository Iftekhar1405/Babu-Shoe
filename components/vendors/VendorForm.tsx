'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Separator } from '@/components/ui/separator';
import { Plus, Minus, Store, Phone, MapPin, Users } from 'lucide-react';
import { Vendor, CreateVendorDto, UpdateVendorDto } from '@/types/vendor.types';
import { useCreateVendor, useUpdateVendor } from '@/lib/vendor.service';
import { toast } from 'sonner';

interface VendorFormProps {
  vendor?: Vendor;
  onSuccess?: (vendor: Vendor) => void;
  onCancel?: () => void;
  mode?: 'create' | 'edit';
}

interface VendorFormData {
  name: string;
  contact: string[];
  logo: string;
  contactPersons: {
    name: string;
    contacts: string[];
  }[];
  address: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export function VendorForm({ vendor, onSuccess, onCancel, mode = 'create' }: VendorFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const createVendorMutation = useCreateVendor();
  const updateVendorMutation = useUpdateVendor();

  const form = useForm<VendorFormData>({
    defaultValues: {
      name: vendor?.name || '',
      contact: vendor?.contact || [''],
      logo: vendor?.logo || '',
      contactPersons: vendor?.contactPersons || [{ name: '', contacts: [''] }],
      address: vendor?.address || '',
      city: vendor?.city || '',
      district: vendor?.district || '',
      state: vendor?.state || '',
      pincode: vendor?.pincode || '',
    },
  });

  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: 'contact',
  });

  const {
    fields: contactPersonFields,
    append: appendContactPerson,
    remove: removeContactPerson,
  } = useFieldArray({
    control: form.control,
    name: 'contactPersons',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
  };

  const onSubmit = async (data: VendorFormData) => {
    setIsSubmitting(true);
    
    try {
      // Validate contact information
      const allContacts = [
        ...data.contact,
        ...data.contactPersons.flatMap(person => person.contacts)
      ];
      
      for (const contact of allContacts) {
        if (contact && !validatePhone(contact) && !validateEmail(contact)) {
          toast.error('Please enter valid phone numbers or email addresses');
          setIsSubmitting(false);
          return;
        }
      }

      const vendorData = {
        name: data.name,
        contact: data.contact.filter(c => c.trim() !== ''),
        logo: data.logo,
        contactPersons: data.contactPersons
          .filter(person => person.name.trim() !== '')
          .map(person => ({
            name: person.name,
            contacts: person.contacts.filter(c => c.trim() !== '')
          })),
        address: data.address,
        city: data.city,
        district: data.district,
        state: data.state,
        pincode: data.pincode,
      };

      let result: Vendor;
      
      if (mode === 'edit' && vendor?._id) {
        result = await updateVendorMutation.mutateAsync({
          id: vendor._id,
          data: vendorData as UpdateVendorDto
        });
        toast.success('Vendor updated successfully');
      } else {
        result = await createVendorMutation.mutateAsync(vendorData as CreateVendorDto);
        toast.success('Vendor created successfully');
      }

      onSuccess?.(result);
      
      if (mode === 'create') {
        form.reset();
      }
    } catch (error) {
      console.error('Error saving vendor:', error);
      toast.error(mode === 'edit' ? 'Failed to update vendor' : 'Failed to create vendor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addContactField = () => {
    appendContact('');
  };

  const removeContactField = (index: number) => {
    if (contactFields.length > 1) {
      removeContact(index);
    }
  };

  const addContactPerson = () => {
    appendContactPerson({ name: '', contacts: [''] });
  };

  const removeContactPersonField = (index: number) => {
    if (contactPersonFields.length > 1) {
      removeContactPerson(index);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Store className="h-5 w-5" />
          <span>{mode === 'edit' ? 'Edit Vendor' : 'Add Vendor'}</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Basic Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="name"
                  rules={{ required: 'Vendor name is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendor Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter vendor name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="logo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter logo URL" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <Separator />

            {/* Contact Numbers */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <Phone className="h-4 w-4" />
                  <span>Contact Numbers</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContactField}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Contact
                </Button>
              </div>

              {contactFields.map((field, index) => (
                <div key={field.id} className="flex items-center space-x-2">
                  <FormField
                    control={form.control}
                    name={`contact.${index}`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            placeholder="Enter phone number or email"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {contactFields.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeContactField(index)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>

            <Separator />

            {/* Contact Persons */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Contact Persons</span>
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addContactPerson}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Person
                </Button>
              </div>

              {contactPersonFields.map((field, personIndex) => (
                <Card key={field.id} className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">Contact Person {personIndex + 1}</h4>
                      {contactPersonFields.length > 1 && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeContactPersonField(personIndex)}
                        >
                          <Minus className="h-4 w-4 mr-1" />
                          Remove
                        </Button>
                      )}
                    </div>

                    <FormField
                      control={form.control}
                      name={`contactPersons.${personIndex}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Person Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter person name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <ContactPersonContacts
                      form={form}
                      personIndex={personIndex}
                    />
                  </div>
                </Card>
              ))}
            </div>

            <Separator />

            {/* Address Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium flex items-center space-x-2">
                <MapPin className="h-4 w-4" />
                <span>Address Information</span>
              </h3>

              <FormField
                control={form.control}
                name="address"
                rules={{ required: 'Address is required' }}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="city"
                  rules={{ required: 'City is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter city" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  rules={{ required: 'District is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter district" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="state"
                  rules={{ required: 'State is required' }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter state" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="pincode"
                  rules={{ 
                    required: 'Pincode is required',
                    pattern: {
                      value: /^[1-9][0-9]{5}$/,
                      message: 'Please enter a valid pincode'
                    }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pincode</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter pincode" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-2 pt-4">
              {onCancel && (
                <Button type="button" variant="outline" onClick={onCancel}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                isLoading={isSubmitting}
                disabled={isSubmitting}
              >
                {mode === 'edit' ? 'Update Vendor' : 'Save Vendor'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

// Helper component for contact person contacts
function ContactPersonContacts({ form, personIndex }: { form: any; personIndex: number }) {
  const {
    fields: contactFields,
    append: appendContact,
    remove: removeContact,
  } = useFieldArray({
    control: form.control,
    name: `contactPersons.${personIndex}.contacts`,
  });

  const addContactField = () => {
    appendContact('');
  };

  const removeContactField = (index: number) => {
    if (contactFields.length > 1) {
      removeContact(index);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FormLabel>Person Contacts</FormLabel>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={addContactField}
        >
          <Plus className="h-3 w-3 mr-1" />
          Add
        </Button>
      </div>

      {contactFields.map((field, index) => (
        <div key={field.id} className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name={`contactPersons.${personIndex}.contacts.${index}`}
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    placeholder="Phone or email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {contactFields.length > 1 && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeContactField(index)}
            >
              <Minus className="h-3 w-3" />
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}