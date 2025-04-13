import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { FileText, Download, RefreshCw, Info } from "lucide-react";
import { reportsApi } from "../services/api";
import { useApi } from "../hooks/useApi";

export function ReportsPage() {
  const [activeTab, setActiveTab] = useState("current");
  const [selectedDocuments, setSelectedDocuments] = useState([]);

  // API hooks
  const {
    data: reports,
    loading: reportsLoading,
    error: reportsError,
    execute: fetchReports
  } = useApi(reportsApi.getAll);

  const {
    data: documents,
    loading: documentsLoading,
    error: documentsError,
    execute: fetchDocuments
  } = useApi(reportsApi.getDocuments);

  const {
    loading: generating,
    error: generateError,
    execute: generateReport
  } = useApi(reportsApi.generate);

  const {
    loading: deleting,
    error: deleteError,
    execute: deleteReport
  } = useApi(reportsApi.delete);

  // Fetch initial data
  useEffect(() => {
    fetchReports();
    fetchDocuments();
  }, [fetchReports, fetchDocuments]);

  const handleDocumentSelection = (docId) => {
    setSelectedDocuments(prev => {
      if (prev.includes(docId)) {
        return prev.filter(id => id !== docId);
      } else {
        return [...prev, docId];
      }
    });
  };

  const handleGenerateReport = async (type) => {
    if (selectedDocuments.length === 0) {
      alert("Please select at least one document");
      return;
    }

    await generateReport(type, selectedDocuments);

    // After successful generation, refresh the reports list
    fetchReports();

    // Clear selection
    setSelectedDocuments([]);
  };

  const handleDeleteReport = async (reportId) => {
    if (window.confirm("Are you sure you want to delete this report?")) {
      await deleteReport(reportId);
      fetchReports();
    }
  };

  const filteredReports = reports ?
    reports.filter(report => activeTab === "current" ? !report.archived : report.archived) :
    [];

  return (
    <div className="mx-auto max-w-7xl p-4">
      <h1 className="mb-6 text-2xl font-bold">AI-Generated Reports</h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="current">Current Reports</TabsTrigger>
                <TabsTrigger value="archived">Archived Reports</TabsTrigger>
              </TabsList>

              <Button
                variant="outline"
                size="sm"
                onClick={fetchReports}
                disabled={reportsLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${reportsLoading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>

            <TabsContent value="current" className="mt-4">
              {reportsLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                    Loading reports...
                  </div>
                </div>
              ) : reportsError ? (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {reportsError}
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No reports generated yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{report.title || `Report #${report.id}`}</CardTitle>
                        <CardDescription>
                          Generated {new Date(report.created_at).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {report.summary || "This report analyzes financial data from the selected documents."}
                        </p>
                        <div className="mt-2">
                          <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                            {report.report_type}
                          </span>
                          <span className="ml-2 text-xs text-muted-foreground">
                            {report.document_count || "Multiple"} documents analyzed
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deleting}
                        >
                          Delete
                        </Button>
                        <Button
                          onClick={() => window.open(`http://localhost:8000/files/${report.file_path}`, '_blank')}
                          size="sm"
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="archived" className="mt-4">
              {/* Similar structure as "current" tab, but showing archived reports */}
              {reportsLoading ? (
                <div className="flex h-40 items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2 h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                    Loading archived reports...
                  </div>
                </div>
              ) : filteredReports.length === 0 ? (
                <div className="flex h-40 flex-col items-center justify-center rounded-lg border border-dashed">
                  <FileText className="mb-2 h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">No archived reports</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredReports.map((report) => (
                    <Card key={report.id}>
                      <CardHeader className="pb-2">
                        <CardTitle>{report.title || `Report #${report.id}`}</CardTitle>
                        <CardDescription>
                          Generated {new Date(report.created_at).toLocaleString()}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">
                          {report.summary || "This report analyzes financial data from the selected documents."}
                        </p>
                      </CardContent>
                      <CardFooter className="flex justify-between pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteReport(report.id)}
                          disabled={deleting}
                        >
                          Delete Permanently
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`http://localhost:8000/files/${report.file_path}`, '_blank')}
                        >
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Generate New Report</CardTitle>
              <CardDescription>
                Select documents and choose a report type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <h3 className="mb-2 font-medium">Select Documents</h3>

              {documentsLoading ? (
                <div className="flex h-20 items-center justify-center">
                  <div className="text-center text-muted-foreground">
                    <div className="mb-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto"></div>
                    Loading documents...
                  </div>
                </div>
              ) : documentsError ? (
                <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {documentsError}
                </div>
              ) : documents && documents.length > 0 ? (
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className={`flex items-center space-x-2 rounded-md border p-2 cursor-pointer ${selectedDocuments.includes(doc.id) ? "border-primary bg-primary/5" : ""
                        }`}
                      onClick={() => handleDocumentSelection(doc.id)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedDocuments.includes(doc.id)}
                        onChange={() => { }}
                        className="h-4 w-4 rounded border-gray-300"
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium">{doc.filename}</p>
                        <p className="text-xs text-muted-foreground">
                          {doc.description || "No description"} • {new Date(doc.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-20 flex-col items-center justify-center rounded-lg border border-dashed">
                  <p className="text-sm text-muted-foreground">No documents available</p>
                </div>
              )}

              <div className="mt-6 space-y-2">
                <h3 className="font-medium">Report Type</h3>
                <div className="grid grid-cols-1 gap-2">
                  <Button
                    onClick={() => handleGenerateReport("summary")}
                    disabled={selectedDocuments.length === 0 || generating}
                    className="justify-start"
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Summary Report</div>
                      <div className="text-xs text-muted-foreground">Key highlights and metrics</div>
                    </div>
                  </Button>

                  <Button
                    onClick={() => handleGenerateReport("analysis")}
                    disabled={selectedDocuments.length === 0 || generating}
                    className="justify-start"
                    variant="outline"
                  >
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <Info className="h-4 w-4 text-primary" />
                    </div>
                    <div className="text-left">
                      <div className="font-medium">Financial Analysis</div>
                      <div className="text-xs text-muted-foreground">Detailed financial breakdown</div>
                    </div>
                  </Button>
                </div>
              </div>

              {generateError && (
                <div className="mt-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                  {generateError}
                </div>
              )}

              {generating && (
                <div className="mt-4 rounded-md bg-primary/5 p-3 text-sm">
                  <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
                    <span>Generating report... This may take a few minutes.</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}