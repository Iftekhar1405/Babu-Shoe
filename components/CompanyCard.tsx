'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Company } from '@/types';
import { Card, CardContent } from '@/components/ui/card';

interface CompanyCardProps {
    Company: Company;
}

export function CompanyCard({ Company }: CompanyCardProps) {
    return (
        <Link href={`/products?Company=${Company._id}`}>
            <Card className="group cursor-pointer overflow-hidden border-gray-200 hover:border-gray-400 transition-all duration-300 hover:shadow-lg">
                <div className="relative h-48 overflow-hidden">
                    <Image
                        src={Company.logo}
                        alt={Company.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />
                </div>
                <CardContent className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-black transition-colors">
                        {Company.name}
                    </h3>
                </CardContent>
            </Card>
        </Link>
    );
}