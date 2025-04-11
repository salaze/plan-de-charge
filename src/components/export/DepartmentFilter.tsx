
import React from 'react';
import { Filter } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface DepartmentFilterProps {
  selectedDepartment: string;
  setSelectedDepartment: (department: string) => void;
}

const DepartmentFilter: React.FC<DepartmentFilterProps> = ({
  selectedDepartment,
  setSelectedDepartment
}) => {
  const departments = [
    { value: "all", label: "Tous les départements" },
    { value: "REC", label: "REC" },
    { value: "78", label: "78" },
    { value: "91", label: "91" },
    { value: "92", label: "92" },
    { value: "95", label: "95" },
  ];

  return (
    <Card className="mb-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          <span>Filtrer les données</span>
        </CardTitle>
        <CardDescription>
          Filtrez les données à exporter par département
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <label className="text-sm font-medium">Département</label>
          <Select
            value={selectedDepartment || "all"}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sélectionnez un département" />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardContent>
    </Card>
  );
};

export default DepartmentFilter;
