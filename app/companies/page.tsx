'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { PageHeader } from '@/components/PageHeader';
import { CompanyCard } from '@/components/CompanyCard';
import { AddCompanyForm } from '@/components/AddCompany';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Company } from '@/types';
import { useCompanies } from '@/lib/company.service';
import { useScreenSize } from '@/context/Screen-size-context';

export default function CompaniesPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {isMobile} = useScreenSize()
  const { data: Companies, isLoading, refetch } = useCompanies()

  const handleCompanyAdded = () => {
    refetch();
    setIsDialogOpen(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showSearch={false} />

      <div className="px-4 sm:px-6 lg:px-8 py-8">
        <PageHeader
          title="Companies"
          description={`${isMobile ? "" : "Manage your product Companies"}`}
          action={{
            label: `${isMobile ? "Add" : "Add Company"}`,
            onClick: () => setIsDialogOpen(true),
          }}
        />

        {Companies?.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 mb-4">No Companies found.</p>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <button className="text-blue-600 hover:text-blue-800">
                  Create your first Company
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <AddCompanyForm onSuccess={handleCompanyAdded} />
              </DialogContent>
            </Dialog>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Companies?.map((Company) => (
              <CompanyCard key={Company._id} Company={Company} />
            ))}
          </div>
        )}

        {/* Add Company Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <AddCompanyForm onSuccess={handleCompanyAdded} />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}