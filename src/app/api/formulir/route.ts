import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

// Definisi tipe data
interface FormulirRef {
  url: string;
  [key: string]: any;
}

interface FormulirData {
  baseurl: string;
  refs: { [key: string]: FormulirRef };
}

// Fungsi untuk membaca file JSON
const readJsonFile = (filePath: string): any => {
  const fullPath = path.join(process.cwd(), "data", filePath);
  const data = fs.readFileSync(fullPath, "utf-8");
  return JSON.parse(data);
};

// Fungsi untuk mendapatkan data formulir
const getFormulir = (): FormulirData => {
  return readJsonFile("formulir.json");
};

// Helper Functions
const createFormulirLink = (
  baseUrl: string = "",
  data: FormulirRef
): string => {
  return `${baseUrl}${data.url}`;
};

const formulirContainer = (
  baseUrl: string,
  refs: { [key: string]: FormulirRef }
) => {
  const result = Object.keys(refs).map((key) => {
    return {
      id: key,
      ...formulirSingleContent(baseUrl, refs[key]),
    };
  });
  return result;
};

const formulirSingleContent = (
  baseUrl: string,
  content: FormulirRef
): FormulirRef => {
  content.url = createFormulirLink(baseUrl, content);
  return content;
};

// API Handlers
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const formulirData = getFormulir();
    const { baseurl, refs } = formulirData;
    const result = formulirContainer(baseurl, refs);

    // Ambil parameter `id` dari query string
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const filteredData = result.find((item) => item.id === id);
      if (filteredData) {
        return NextResponse.json(
          {
            status: 200,
            data: filteredData,
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
