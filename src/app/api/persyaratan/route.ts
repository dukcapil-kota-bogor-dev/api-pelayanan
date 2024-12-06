import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Definisi tipe data
interface Ref {
  url: string;
}

interface Content {
  refs?: any[];
  [key: string]: any;
}

interface Persyaratan {
  id?: string;
  contents: Content[];
  [key: string]: any;
}

interface Formulir {
  refs: { [key: string]: Ref };
  baseurl: string;
}

// Fungsi untuk membaca file JSON
const readJsonFile = (filePath: string): any => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data);
};

// Fungsi untuk mendapatkan data persyaratan
const getPersyaratan = (): Persyaratan => {
  return readJsonFile("persyaratan.json");
};

// Fungsi untuk mendapatkan data formulir
const getFormulir = (): Formulir => {
  return readJsonFile("formulir.json");
};

// Helper Functions
const createFormulirLink = (baseUrl: string = "", data: Ref): string => {
  return `${baseUrl}${data.url}`;
};

const persyaratanSetToRef = (data: any[]): any[] => {
  const formulirData = getFormulir();
  const { refs: formulirRefs, baseurl: formulirBaseUrl } = formulirData;

  return data.map((item) =>
    persyaratanSingleSetToRef(formulirRefs, formulirBaseUrl, item)
  );
};

const persyaratanSingleSetToRef = (
  refs: { [key: string]: Ref },
  baseUrl: string,
  data: any
): any => {
  const ref = refs[data.toRef];
  if (!ref) {
    throw new Error(`Reference ${data.toRef} not found.`);
  }
  ref.url = createFormulirLink(baseUrl, ref);
  delete data.toRef;
  return { ...data, ...ref };
};

const persyaratanContainer = (data: any[]): any[] => {
  return data.map((item) => ({
    ...item,
    contents: persyaratanProcessContents(item.contents),
  }));
};

const persyaratanProcessContents = (contents: Content[]): Content[] => {
  return contents.map((content) => persyaratanProcessSingleContent(content));
};

const persyaratanProcessSingleContent = (content: Content): Content => {
  if (content.refs) {
    content.refs = persyaratanSetToRef(content.refs);
  }
  return content;
};

// API Handlers
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const persyaratanData = getPersyaratan();
    const result = persyaratanContainer(persyaratanData.contents);

    // Ambil parameter `id` dari query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const filteredData = result.filter((item) => item.id === id);
      if (filteredData.length > 0) {
        return NextResponse.json(
          {
            status: 200,
            data: filteredData[0],
          },
          { status: 200 }
        );
      }
      return NextResponse.json(
        {
          status: 404,
          error: "id not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: 200,
        data: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      {
        status: 500,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS(): Promise<NextResponse> {
  return NextResponse.json(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, Authorization, Content-Type",
      "Access-Control-Max-Age": "86400",
    },
  });
}
