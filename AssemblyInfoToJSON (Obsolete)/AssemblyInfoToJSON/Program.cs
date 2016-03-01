using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Reflection;
using System.Text;

namespace AssemblyInfoToJSON
{
    class Program
    {
        static void Main(string[] args)
        {
            string dllPath;
            try
            {
                dllPath = args[0];
                //dllPath = @"D:\Selenium\AutoTestApp\AutoTestApp.Adorama\bin\Debug\AutoTestApp.Adorama.dll";
            }
            catch
            {
                Console.WriteLine("Argument for DLL path is missed!");
                Console.ReadKey();
                return;
            }

            string outputFile;
            try
            {
                outputFile = args[1];
            }
            catch
            {
                Console.WriteLine("Argument for output file is missed!");
                Console.ReadKey();
                return;
            }


            Assembly dll;
            try
            {
                dll = Assembly.LoadFrom(dllPath);
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex.Message);
                Console.ReadKey();
                return;
            }

            List<TypeInfo> testFixtures;

            try
            {
                testFixtures = dll.DefinedTypes.Where(type => type.BaseType.FullName == "AutoTestApp.Common.Framework.BaseTest").ToList();
            }
            catch (ReflectionTypeLoadException ex)
            {
                StringBuilder sb = new StringBuilder();
                foreach (Exception exSub in ex.LoaderExceptions)
                {
                    sb.AppendLine(exSub.Message);
                    FileNotFoundException exFileNotFound = exSub as FileNotFoundException;
                    if (exFileNotFound != null)
                    {
                        if (!string.IsNullOrEmpty(exFileNotFound.FusionLog))
                        {
                            sb.AppendLine("Fusion Log:");
                            sb.AppendLine(exFileNotFound.FusionLog);
                        }
                    }
                    sb.AppendLine();
                }
                string errorMessage = sb.ToString();
                Console.WriteLine(errorMessage);
                return;
            }

            dynamic testInfo = new ExpandoObject();
            testInfo.fixtures = new List<dynamic>();
            foreach(var fixture in testFixtures)
            {
                dynamic fixtureInfo = new ExpandoObject();
                fixtureInfo.name = fixture.Name;
                fixtureInfo.tests = GetTestsInfo(fixture);
                    
                testInfo.fixtures.Add(fixtureInfo);
            }

            string json = JsonConvert.SerializeObject(testInfo);
            File.WriteAllText(outputFile, json);
            //Console.WriteLine(json);
            //Console.ReadKey();
        }

        static List<dynamic> GetTestsInfo(TypeInfo fixture)
        {
            List<MethodInfo> tests = fixture.DeclaredMethods.Where(method => method.CustomAttributes.Any(attr => attr.AttributeType.Name.Equals("TestAttribute"))).ToList();
            List<dynamic> testsInfo = new List<dynamic>();

            foreach(MethodInfo test in tests)
            {
                dynamic testInfo = new ExpandoObject();
                testInfo.name = test.Name;
                testInfo.assembly = test.ReflectedType.FullName;

                testsInfo.Add(testInfo);
            }
            return testsInfo;
        }
    }
}
