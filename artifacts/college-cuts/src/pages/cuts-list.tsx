import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListCuts } from "@workspace/api-client-react";
import { format, parseISO } from "date-fns";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge, CutTypeBadge } from "@/components/shared/Badges";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { STATES, CUT_TYPE_LABELS } from "@/lib/constants";

export default function CutsList() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);

  // Parse state from URL params
  const page = parseInt(params.get("page") || "1", 10);
  const search = params.get("search") || "";
  const stateFilter = params.get("state") || "";
  const typeFilter = params.get("cutType") || "";
  const statusFilter = params.get("status") || "";
  const controlFilter = params.get("control") || "";

  // Helper to update URL params
  const updateParams = (newParams: Record<string, string | null>) => {
    const current = new URLSearchParams(searchString);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null || value === "") {
        current.delete(key);
      } else {
        current.set(key, value);
      }
    });
    // Reset to page 1 on filter changes unless page is explicitly set
    if (!newParams.page && current.has("page")) {
      current.set("page", "1");
    }
    window.history.pushState(null, "", `?${current.toString()}`);
    // A bit hacky, but wouter doesn't have a great way to trigger re-render on query param change purely from within without useLocation. 
    // We'll rely on useListCuts reactive re-fetching, but we need local state for the inputs to feel snappy.
  };

  const [localSearch, setLocalSearch] = useState(search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams({ search: localSearch });
  };

  const { data, isLoading } = useListCuts({
    page,
    limit: 20,
    search: search || undefined,
    state: stateFilter || undefined,
    cutType: typeFilter || undefined,
    status: statusFilter || undefined,
    control: controlFilter || undefined,
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-extrabold tracking-tight text-primary">All Actions Database</h1>
        <p className="text-lg text-muted-foreground">
          Browse the complete, searchable index of reported program cuts, closures, and layoffs.
        </p>
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-card p-4 rounded-lg border shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search institutions or programs..." 
            className="pl-9"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
          />
        </form>
        
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mr-2 hidden lg:flex">
            <SlidersHorizontal className="h-4 w-4" /> Filters:
          </div>
          
          <Select value={stateFilter} onValueChange={(val) => updateParams({ state: val === "all" ? null : val })}>
            <SelectTrigger className="w-[110px]">
              <SelectValue placeholder="State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All States</SelectItem>
              {STATES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(val) => updateParams({ cutType: val === "all" ? null : val })}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Action Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {Object.entries(CUT_TYPE_LABELS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={(val) => updateParams({ status: val === "all" ? null : val })}>
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="ongoing">Ongoing</SelectItem>
              <SelectItem value="reversed">Reversed</SelectItem>
              <SelectItem value="rumor">Rumor</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50 hover:bg-muted/50">
              <TableHead>Institution</TableHead>
              <TableHead>Program / Dept</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array(10).fill(0).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[40px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[120px] rounded-full" /></TableCell>
                  <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                </TableRow>
              ))
            ) : data?.data && data.data.length > 0 ? (
              data.data.map((cut) => (
                <TableRow key={cut.id} className="cursor-pointer hover:bg-muted/50 group">
                  <TableCell className="font-medium">
                    <Link href={`/cuts/${cut.id}`} className="block absolute inset-0 z-10" aria-label={`View details for ${cut.institution}`} />
                    <span className="group-hover:text-primary transition-colors relative z-20 pointer-events-none">
                      {cut.institution}
                    </span>
                  </TableCell>
                  <TableCell className="text-muted-foreground max-w-[200px] truncate relative z-20">
                    {cut.programName || "-"}
                  </TableCell>
                  <TableCell className="relative z-20">{cut.state}</TableCell>
                  <TableCell className="relative z-20">
                    <CutTypeBadge cutType={cut.cutType} />
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap relative z-20">
                    {format(parseISO(cut.announcementDate), "MMM d, yyyy")}
                  </TableCell>
                  <TableCell className="relative z-20">
                    <StatusBadge status={cut.status} />
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground">
                  No records found matching your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between px-2">
          <div className="text-sm text-muted-foreground">
            Showing <span className="font-medium">{(page - 1) * 20 + 1}</span> to <span className="font-medium">{Math.min(page * 20, data.total)}</span> of <span className="font-medium">{data.total}</span> results
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page - 1) })}
              disabled={page <= 1}
            >
              <ChevronLeft className="mr-1 h-4 w-4" /> Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => updateParams({ page: String(page + 1) })}
              disabled={page >= data.totalPages}
            >
              Next <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
