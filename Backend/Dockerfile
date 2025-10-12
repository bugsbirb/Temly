FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY TriMelERM-backend.sln ./
COPY TriMelERM-backend/TriMelERM-backend.csproj TriMelERM-backend/
RUN dotnet restore TriMelERM-backend/TriMelERM-backend.csproj
COPY . .
WORKDIR /src/TriMelERM-backend
RUN dotnet publish -c Release -o /app/publish --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .
EXPOSE 8080
ENV DOTNET_RUNNING_IN_CONTAINER=true
ENV DOTNET_PRINT_TELEMETRY_MESSAGE=false
ENTRYPOINT ["dotnet", "TriMelERM-backend.dll"]
